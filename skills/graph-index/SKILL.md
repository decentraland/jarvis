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

- Include every service found in the manifests — do not skip any
- For the graph: derive edges from `dependencies.services` and event flows from `events.publishes` / `events.consumes`
- For the index: extract only the compact fields (name, display_name, description, layer, repository, dependencies)
- Follow the provided schemas exactly
- Write the files directly — do not output to terminal
