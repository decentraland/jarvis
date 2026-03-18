import { execSync } from 'node:child_process'

export function repoName(url: string): string {
  return url.split('/').at(-1)!
}

export async function fetchLatestCommit(url: string, retries = 3): Promise<string> {
  const [owner, name] = url.replace('https://github.com/', '').split('/')
  const token = process.env.GITHUB_TOKEN
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${name}/commits?per_page=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      })
      if (!res.ok) throw new Error(`GitHub API error for ${owner}/${name}: ${res.status} ${res.statusText}`)
      const data = (await res.json()) as Array<{ sha: string }>
      return data[0].sha
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
  throw new Error('unreachable')
}

export function cloneRepo(url: string, dest: string): void {
  const token = process.env.GITHUB_TOKEN
  const authedUrl = url.replace('https://', `https://x-access-token:${token}@`)
  try {
    execSync(`git clone --depth 1 --progress ${authedUrl} ${dest}`, { stdio: 'inherit' })
  } catch {
    throw new Error(`git clone failed for ${url}`)
  }
}

export function pullRepo(dest: string, url: string): void {
  const token = process.env.GITHUB_TOKEN
  const authedUrl = url.replace('https://', `https://x-access-token:${token}@`)
  try {
    execSync(`git remote set-url origin ${authedUrl} && git fetch --depth 1 origin && git reset --hard origin/HEAD`, { cwd: dest, stdio: 'inherit' })
  } catch {
    throw new Error(`git pull failed for ${dest}`)
  }
}
