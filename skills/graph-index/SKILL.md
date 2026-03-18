---
name: graph-index
description: Generate a cross-service dependency graph and compact service index from existing manifest YAML files. Activated when the prompt asks to produce graph.yaml and index.yaml.
---

# Graph & Index Generation

You produce two derived files from a set of service manifest YAMLs.

## Paths

All paths are relative to the working directory (project root):
- `manifests/` — contains all service manifest YAMLs
- `manifests/graph.yaml` — output: dependency graph
- `manifests/index.yaml` — output: service index
- `skills/graph-index/graph-schema.yaml` — schema for the dependency graph
- `skills/graph-index/index-schema.yaml` — schema for the service index

## Schemas

Read the schema files. The output files must follow these schemas exactly.

## Workflow

1. List all YAML files in `manifests/` (exclude `graph.yaml` and `index.yaml`)
2. Read each manifest file
3. Extract dependency and event information to build the graph
4. Extract service metadata to build the index
5. Write `manifests/graph.yaml` and `manifests/index.yaml`

## Rules

- When regenerating, read existing `graph.yaml` and `index.yaml` first to preserve any manually added entries (e.g., edges for dependencies not yet in individual manifests)
- Include every service found in the manifests — do not skip any
- For the graph: create one node per service (`name`, `display_name`, `layer`, `repository`). Create edges from `dependencies.services` entries — use dependency `relationship`, `protocol`, and `purpose` (as description). Create event_flows from `events.publishes` matched with `events.consumes` across services.
- For the index: for each service extract from the manifest: `name`, `display_name`, `description`, `layer`, `repository` from `service:` section; `role` (array) and `data_domain` (array) from `service:` section; dependencies list with `name`, `relationship`, and `protocol` from `dependencies.services`.
- Deduplicate: if the same dependency `name` appears more than once under a service, keep only one entry
- Follow the provided schemas exactly
- Write the files directly — do not output to terminal
