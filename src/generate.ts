import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createAgentSession,
  SessionManager,
  SettingsManager,
  DefaultResourceLoader,
  AuthStorage,
  ModelRegistry,
  createCodingTools,
} from '@mariozechner/pi-coding-agent'
import { workspaces, type Repo } from './repos.js'
import { repoName, fetchLatestCommit, cloneRepo } from './github.js'
import { rewriteWorkspaces } from './utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectDir = join(__dirname, '..')
const authPath = join(projectDir, '.auth.json')
const manifestsDir = join(projectDir, 'manifests')
const tmpDir = join(projectDir, 'tmp')
const systemPromptPath = join(projectDir, 'prompts', 'system.md')

let authStorage: AuthStorage | null = null

async function runAgentSession(prompt: string, cwd: string): Promise<string> {
  if (!authStorage) throw new Error('Agent not initialized')

  console.log(`[agent] initializing session (cwd: ${cwd})`)
  const systemPrompt = readFileSync(systemPromptPath, 'utf-8').trim()
  const modelRegistry = new ModelRegistry(authStorage)
  const model = modelRegistry.find('anthropic', 'claude-sonnet-4-5')
  if (!model) throw new Error('Model "anthropic/claude-sonnet-4-5" not found')

  const resourceLoader = new DefaultResourceLoader({
    cwd,
    additionalSkillPaths: [join(projectDir, 'skills')],
    systemPrompt,
    noExtensions: true,
    noPromptTemplates: true,
    noThemes: true,
  })
  await resourceLoader.reload()

  console.log(`[agent] creating session...`)
  const { session } = await createAgentSession({
    cwd,
    authStorage,
    modelRegistry,
    model,
    sessionManager: SessionManager.inMemory(),
    settingsManager: SettingsManager.inMemory(),
    resourceLoader,
    tools: createCodingTools(cwd),
  })

  try {
    console.log(`[agent] running prompt (${prompt.length} chars)...`)
    console.log(`[agent] prompt: ${prompt.slice(0, 200)}`)
    console.log(`[agent] model: ${model.id}`)
    await session.prompt(prompt)

    const messageCount = session.messages.length
    console.log(`[agent] messages in session: ${messageCount}`)
    for (const msg of session.messages) {
      const content = 'content' in msg ? JSON.stringify(msg.content).slice(0, 200) : 'N/A'
      const extra = msg.role === 'assistant'
        ? ` stopReason=${(msg as any).stopReason} error=${(msg as any).errorMessage ?? 'none'}`
        : ''
      console.log(`[agent]   role=${msg.role}${extra} content=${content}`)
    }

    const { cost, tokens } = computeUsage(session.messages)
    console.log(`[agent] done — ${tokens} tokens, $${cost.toFixed(4)}`)

    const result = session.getLastAssistantText() || ''
    console.log(`[agent] result length: ${result.length}`)
    return result
  } finally {
    session.dispose()
  }
}

function computeUsage(messages: any[]): { cost: number; tokens: number } {
  let cost = 0
  let tokens = 0
  for (const msg of messages) {
    if (msg.role === 'assistant' && msg.usage) {
      cost += msg.usage.cost?.total ?? 0
      tokens += msg.usage.totalTokens ?? 0
    }
  }
  return { cost, tokens }
}


async function generateManifests(repoNames: string[]): Promise<void> {
  const BATCH_SIZE = 10
  const totalBatches = Math.ceil(repoNames.length / BATCH_SIZE)
  for (let i = 0; i < repoNames.length; i += BATCH_SIZE) {
    const batch = repoNames.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    console.log(`[generate] running agent for batch ${batchNum}/${totalBatches} (${batch.length} repos)...`)
    await runAgentSession(`generate manifests: ${batch.join(', ')}`, projectDir)
  }
  console.log(`[generate] all manifests written`)
}

async function generateGraphAndIndex(): Promise<void> {
  console.log('[generate] building graph and index...')
  await runAgentSession('generate graph and index', projectDir)
  console.log('[generate] graph and index written')
}

async function main(): Promise<void> {
  const githubToken = process.env.GITHUB_TOKEN
  const oauthToken = process.env.ANTHROPIC_OAUTH_REFRESH_TOKEN

  if (!githubToken) throw new Error('GITHUB_TOKEN env var is required')

  // Init auth
  if (existsSync(authPath)) {
    console.log('[generate] using existing .auth.json')
  } else if (oauthToken) {
    console.log('[generate] seeding .auth.json from ANTHROPIC_OAUTH_REFRESH_TOKEN')
    writeFileSync(authPath, JSON.stringify({
      anthropic: { type: 'oauth', refresh: oauthToken, access: '', expires: 0 },
    }), 'utf-8')
  } else {
    throw new Error('No auth available. Set ANTHROPIC_OAUTH_REFRESH_TOKEN or place a valid .auth.json in the project root.')
  }

  authStorage = AuthStorage.create(authPath)

  mkdirSync(manifestsDir, { recursive: true })
  rmSync(tmpDir, { recursive: true, force: true })
  mkdirSync(tmpDir, { recursive: true })

  const toProcess: Array<{ wsUrl: string; repo: Repo; currentCommit: string }> = []

  for (const [wsUrl, repos] of Object.entries(workspaces)) {
    const wsName = repoName(wsUrl)
    const wsDest = join(tmpDir, wsName)

    if (!existsSync(wsDest)) {
      console.log(`[generate] cloning workspace ${wsName}...`)
      cloneRepo(wsUrl, wsDest)
    }

    for (const repo of repos) {
      const name = repoName(repo.url)

      let currentCommit: string
      try {
        currentCommit = await fetchLatestCommit(repo.url)
      } catch (err) {
        console.error(`[generate] failed to fetch commit for ${name}:`, err)
        continue
      }

      if (repo.lastCommit === currentCommit) {
        console.log(`[generate] skipping ${name} (up to date at ${currentCommit.slice(0, 8)})`)
        continue
      }

      const dest = join(tmpDir, name)
      try {
        console.log(`[generate] cloning ${name}...`)
        cloneRepo(repo.url, dest)
        toProcess.push({ wsUrl, repo, currentCommit })
      } catch (err) {
        console.error(`[generate] failed to clone ${name}:`, err)
        rmSync(dest, { recursive: true, force: true })
      }
    }
  }

  if (toProcess.length === 0) {
    console.log('[generate] all repos up to date, nothing to do')
    rmSync(tmpDir, { recursive: true, force: true })
    return
  }

  await generateManifests(toProcess.map(t => repoName(t.repo.url)))

  // Update lastCommit for all processed repos
  const updated = structuredClone(workspaces)
  for (const { wsUrl, repo, currentCommit } of toProcess) {
    const wsRepos = updated[wsUrl]
    const idx = wsRepos.findIndex(r => r.url === repo.url)
    if (idx !== -1) {
      wsRepos[idx] = { ...wsRepos[idx], lastCommit: currentCommit }
    }
  }
  rewriteWorkspaces(updated)
  console.log(`[generate] updated lastCommit for ${toProcess.length} repos`)

  await generateGraphAndIndex()

  rmSync(tmpDir, { recursive: true, force: true })
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
