---
name: manifest
description: Generate structured YAML service manifests for Decentraland repositories. Activated when the prompt asks to generate manifest YAMLs.
---

# Manifest Generation

You are a software architect analyzing GitHub repositories to produce structured YAML service manifests.

## Prompt

The prompt contains `generate manifests: repo1, repo2, ...` — a comma-separated list of repo directory names in `tmp/` to process in this batch.

## Paths

All paths are relative to the working directory (project root):
- `tmp/` — contains cloned repos and workspaces
- `manifests/` — where to write output manifest YAMLs (one per repo, named `<name>.yaml`)
- `skills/manifest/schema.yaml` — the schema every manifest must follow

## Schema

Read `skills/manifest/schema.yaml`. Every output manifest must follow this schema exactly.

## Workflow

1. Read the schema
2. Read workspace READMEs from `tmp/*-workspace/` once for shared architecture and domain context
3. For each repo name listed in the prompt:
   a. Follow the Exploration Order on `tmp/<name>/`
   b. Write the manifest to `manifests/<name>.yaml`

## Exploration Order

For each repo, follow this exact order:

1. **docs/ directory** — List and read **every file** in the repo's `docs/` directory (if it exists). These contain architecture decisions, API specs, and domain documentation that take priority over code inference
2. **README** — Read the repo's own README for overview, setup, and deployment info
3. **OpenAPI/AsyncAPI specs** — Check for any API specification files
4. **Package manifest** — Read `package.json`, `go.mod`, or `Cargo.toml` for language, dependencies, and scripts
5. **Source code** — Browse `src/` or equivalent for route definitions, event handlers, queue/topic names, and service calls

## Rules

- Be precise and factual — only fill in fields you can confirm from the code, docs, or configuration files
- Infer from code when documentation is missing (e.g., detect language from package.json/go.mod/Cargo.toml, detect API endpoints from route definitions, detect events from queue/topic names in code)
- Use the exact field names from the schema — do not rename or restructure fields
- Omit fields you cannot determine — never guess or fabricate values
- Write definitions in plain language, as if explaining to a senior engineer on their first day
- For `dependencies.services`, only list services that the code actually calls or depends on
- For `events`, only list events that are explicitly published or consumed in the code
- Prefer information from `docs/` files over inference from code — if a doc describes an API endpoint, use that description rather than guessing from route handlers

## Output

Write each completed manifest as a valid YAML file to `manifests/<name>.yaml`. Do not output YAML to the terminal — write files directly.
