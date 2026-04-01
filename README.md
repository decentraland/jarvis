# @dcl/jarvis

Auto-generated service manifests for the Decentraland platform. An AI agent clones each repository, reads its code and workspace documentation, and produces a structured YAML manifest describing the service's domain, API, dependencies, events, and configuration.

## What's inside

- **`manifests/<service>.yaml`** — one manifest per repository, following a strict schema (`src/manifest.example.yaml`)
- **`manifests/graph.yaml`** — cross-service dependency graph (who calls whom, event flows)
- **`manifests/index.yaml`** — compact service index optimized for minimal token consumption

## Install

```bash
npm install @dcl/jarvis
```

The published package includes only the `manifests/` directory.

## Development

### Prerequisites

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description |
|---|---|
| `GITHUB_TOKEN` | Fine-grained token with repo read access (for cloning + GitHub API) |
| `ANTHROPIC_OAUTH_REFRESH_TOKEN` | Seeds `.auth.json` for the Claude agent (first run only) |

### Generate manifests

```bash
npm run generate
```

This will:

1. Check each repo in `src/repos.ts` for new commits via the GitHub API
2. For repos with changes, clone the repo and its workspace(s)
3. Run a Claude agent that reads the code + workspace README and writes a manifest YAML
4. After all manifests are processed, regenerate `graph.yaml` and `index.yaml`

Repos that haven't changed since the last run are skipped (tracked via `lastCommit` in `src/repos.ts`).

### Authentication (OAuth)

All Anthropic auth uses OAuth — there is no API key path.

1. A **refresh token** is exchanged for a short-lived **access token** on each API call.
2. The SDK may **rotate the refresh token** after use, so the original token becomes invalid.
3. The current auth state (refresh + access + expiry) is persisted in `.auth.json`.

- **First run** — set `ANTHROPIC_OAUTH_REFRESH_TOKEN` in `.env`. The generator writes `.auth.json` on startup and uses that going forward.
- **Existing session** — copy `.auth.json` from another pi-agent or OpenDCL session into the project root. No env var needed.

**Why `.auth.json` matters:** because refresh tokens rotate on use, the file is the source of truth. The env var is only a seed for first-time setup.

### Project structure

```
src/
  repos.ts                # List of repositories + workspace URLs
  generate.ts             # Main generation pipeline
  manifest.example.yaml   # Schema for service manifests
  graph.example.yaml      # Schema for the dependency graph
  index.example.yaml      # Schema for the service index
prompts/
  system.md               # System prompt for the manifest-generation agent
manifests/                # Generated output (published via npm)
```

## License

Apache-2.0
