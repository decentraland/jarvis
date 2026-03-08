import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Repo } from './repos.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function rewriteRepos(updatedWorkspaces: Record<string, Repo[]>, updatedStandalone: Repo[]): void {
  const lines: string[] = [
    `export interface Repo {`,
    `  url: string`,
    `  lastCommit: string | null`,
    `}`,
    ``,
    `export const workspaces: Record<string, Repo[]> = {`,
  ]

  for (const [wsUrl, repos] of Object.entries(updatedWorkspaces)) {
    lines.push(`  '${wsUrl}': [`)
    for (const r of repos) {
      const commitStr = r.lastCommit ? `'${r.lastCommit}'` : 'null'
      lines.push(`    { url: '${r.url}', lastCommit: ${commitStr} },`)
    }
    lines.push(`  ],`)
  }

  lines.push(`}`)
  lines.push(``)
  lines.push(`export const standalone: Repo[] = [`)
  for (const r of updatedStandalone) {
    const commitStr = r.lastCommit ? `'${r.lastCommit}'` : 'null'
    lines.push(`  { url: '${r.url}', lastCommit: ${commitStr} },`)
  }
  lines.push(`]`)
  lines.push(``)
  writeFileSync(join(__dirname, 'repos.ts'), lines.join('\n'), 'utf-8')
}
