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
   a. Check if `manifests/<name>.yaml` already exists
   b. If it exists, read it as the baseline — this is **update mode** (see Update Mode section below)
   c. Follow the Exploration Order on `tmp/<name>/`
   d. Write the manifest to `manifests/<name>.yaml`

## Exploration Order

For each repo, follow this exact order:

1. **docs/ directory** — List and read **every file** in the repo's `docs/` directory (if it exists). These contain architecture decisions, API specs, and domain documentation that take priority over code inference
2. **README** — Read the repo's own README for overview, setup, and deployment info
3. **OpenAPI/AsyncAPI specs** — Check for any API specification files
4. **Package manifest** — Read `package.json`, `go.mod`, or `Cargo.toml` for language, dependencies, and scripts
5. **Source code — routes, events, logic** — Browse `src/` or equivalent for route definitions, event handlers, queue/topic names, and business logic
6. **Service dependency discovery** — This is CRITICAL. Dependencies are often hidden behind adapter patterns and generic HTTP clients. You MUST check ALL of the following:
   a. **Adapters directory** — List `src/adapters/` (or similar). Each subdirectory named after another service (e.g., `src/adapters/social-service/`, `src/adapters/catalyst-client/`) is a service dependency. Read the main file in each to confirm the target service and protocol.
   b. **AppComponents / types** — Read `src/types.ts` or `src/components.ts`. The `AppComponents` interface lists all injected components — look for adapters that wrap calls to other Decentraland services.
   c. **Environment variables** — Read `.env.default`, `.env`, or grep for `process.env` / `getEnvConfig`. URLs like `*_SERVICE_URL`, `*_API_URL`, or `*_BASE_URL` point to service dependencies (e.g., `SOCIAL_SERVICE_URL` means this service calls social-service-ea).
   d. **HTTP fetch calls** — Search source for `fetch(`, `fetcher.`, `httpClient`, or URL-building patterns that target other Decentraland services.
   e. **gRPC / protobuf clients** — Search for `createRpcClient`, `@dcl/protocol` imports, or `.proto` usage indicating gRPC dependencies.
   f. **SNS/SQS publishers and consumers** — Search for SNS topic ARNs, SQS queue names, or `sns.publish` / `sqs.receiveMessage` patterns to find async dependencies.
7. **Environment variable discovery for `key_env_vars`** — This is CRITICAL to avoid hallucination. You MUST derive env var names from actual code, never guess them. Check these sources in order:
   a. **`.env.default`** — Read this file first. It is the canonical list of all configurable env vars with their default values and often includes comments explaining each one.
   b. **`config.requireString` / `config.getString` / `config.getNumber`** — Search source for these patterns (used by `@well-known-components/env-config-provider`). Each call references an actual env var name.
   c. **`process.env`** — Search for direct `process.env.VAR_NAME` access.
   d. **Only list env vars you found in the code** — never invent env var names based on what "seems likely". If `.env.default` doesn't exist and no config calls are found, leave `key_env_vars` empty.
## Rules

- Be precise and factual — only fill in fields you can confirm from the code, docs, or configuration files
- Infer from code when documentation is missing (e.g., detect language from package.json/go.mod/Cargo.toml, detect API endpoints from route definitions, detect events from queue/topic names in code)
- Use the exact field names from the schema — do not rename or restructure fields
- Omit fields you cannot determine — never guess or fabricate values
- Write definitions in plain language, as if explaining to a senior engineer on their first day
- For `dependencies.services`, list ALL services that the code calls or depends on. Do NOT rely solely on package.json — many service dependencies use generic HTTP fetch, not dedicated client libraries. Always complete step 6 (Service dependency discovery) to find adapter-pattern and env-var-configured dependencies
- For `events`, only list events that are explicitly published or consumed in the code
- Prefer information from `docs/` files over inference from code — if a doc describes an API endpoint, use that description rather than guessing from route handlers
- For `configuration.key_env_vars`, ONLY list env vars found in `.env.default`, `config.requireString()`, `config.getString()`, or `process.env`. Never invent env var names — this is a common source of hallucination.
- When updating an existing manifest, treat it as curated truth. Only override fields where code evidence is stronger. Exception: `key_env_vars` should always be replaced with code-verified values since existing ones may have been hallucinated.
- For URL fields (`ai-agent-context`, `openapi_url`, `schema_url`, `repository`), only use URLs that point to files confirmed to exist in the repo. Check `docs/` directory listing to verify. If a file doesn't exist, leave the field as an empty string `""` — never guess or construct URLs for files that may not exist.

## Update Mode

When `manifests/<name>.yaml` already exists:

1. **Read the existing manifest first** — it is your baseline
2. **Preserve all existing sections** — do not remove or rewrite content that is already correct
3. **Add missing fields** — if exploration reveals fields the existing manifest lacks (e.g., missing dependencies, missing events, missing env vars), add them
4. **Update stale fields** — if the code clearly contradicts the manifest (e.g., a dependency was removed, a field value is wrong), update it
5. **Never downgrade** — do not remove domain glossary entries, concept relationships, invariants, or other rich content just because you didn't find them in code. These may have been manually curated.
6. **Merge dependencies** — for `dependencies.services`, union the existing list with newly discovered dependencies. Do not drop existing ones unless the code proves they no longer exist.
7. **Schema compliance** — Compare the existing manifest against `skills/manifest/schema.yaml`. If the schema has fields that the manifest is missing, add them by exploring the codebase. Update `schema_version` to match the schema's version.

Priority order for conflicts: docs/ > existing manifest > code inference

## Output

Write each completed manifest as a valid YAML file to `manifests/<name>.yaml`. Do not output YAML to the terminal — write files directly.
