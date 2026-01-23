# Markdown Frontmatter Schema (AIX Hygiene)

- **Title:** Markdown Frontmatter Schema (AIX Hygiene)
- **Owner(s):** AIX maintainers
- **Status:** draft
- **Scope:** Markdown files under `aix/` (context, docs, specs, runbooks, logs) and mounted projects when the markdown is part of the curated AIX surface. Ignore vendor files and build outputs (e.g., `node_modules/`, `_site/`, `.sanity/`, `dist/`, `vendor/`).
- **Links:** [context/constraints.md](../../context/constraints.md), [context/current-goals.md](../../context/current-goals.md), [specs/features/file-aix-hygiene.md](file-aix-hygiene.md), [specs/features/js-frontmatter-schema.md](js-frontmatter-schema.md)

## Goals
- Give AIX a fast, deterministic way to understand Markdown intent without reading the full file.
- Standardize metadata so hygiene tools and agents can prioritize what to read or ignore.
- Keep metadata light, non-invasive, and safe (no behavior changes).

## Non-Goals
- Not a runtime config system.
- Not a replacement for README/spec documentation.
- No timestamps or freshness signals (use git metadata instead).

## Format
- Use YAML frontmatter at the top of the Markdown file.
- The frontmatter block must be the **first non-empty content** in the file.
- Delimiters are `---` lines.

### Canonical wrapper
```md
---
aix:
  id: aix.specs.features.markdown-frontmatter-schema
  role: Define the Markdown frontmatter standard for AIX hygiene.
  status: draft
  surface: internal
---
```

## Schema

### Required fields
- `aix.id` (string): unique, dot-delimited identifier.
- `aix.role` (string): short, concrete description of purpose.
- `aix.status` (enum): `draft | stable | deprecated`.
- `aix.surface` (enum): `internal | public`.

### Optional fields
- `aix.owner` (string): team or maintainer.
- `aix.tags` (string[]): short tags for search and grouping.
- `aix.type` (enum): `spec | decision | runbook | context | guide | log | template | note`.
- `aix.scope` (enum): `aix | frontend | backend | shared`.
- `aix.audience` (enum): `maintainers | contributors | operators | public`.
- `aix.links` (string[]): related docs or specs (relative paths preferred).
- `aix.dependsOn` (string[]): notable dependencies or files.
- `aix.affects` (string[]): affected areas (e.g. `drift`, `specs`, `docs`).
- `aix.perf` (object):
  - `readPriority` (enum): `high | medium | low`.
  - `cacheSafe` (boolean): safe to cache in curated context.
  - `critical` (boolean): impacts AIX stability or scoring.
- `aix.notes` (string): short clarifying note (1–2 sentences max).

## Parsing rules
- Only the first frontmatter block is considered.
- If the file begins with `---`, parse YAML until the next `---`.
- Ignore malformed YAML and treat the file as having no frontmatter.
- Do not include secrets, tokens, or operational credentials.
- Skip vendor and build output paths entirely (same as repo ignore rules).

## Examples

### `aix/specs/features/file-aix-hygiene.md`
```md
---
aix:
  id: aix.specs.features.file-aix-hygiene
  role: Define the file hygiene rules for AIX repositories.
  status: stable
  surface: internal
  owner: AIX
  tags:
    - hygiene
    - files
  type: spec
  scope: aix
  audience: maintainers
  perf:
    readPriority: high
    cacheSafe: true
    critical: true
---
```

### `aix/docs/runbooks/context-refresh.md`
```md
---
aix:
  id: aix.docs.runbooks.context-refresh
  role: Runbook for refreshing AIX context packs.
  status: stable
  surface: internal
  owner: AIX
  tags:
    - runbook
    - context
    - tooling
  type: runbook
  scope: aix
  audience: operators
  perf:
    readPriority: high
    cacheSafe: true
    critical: true
---
```

## Adoption checklist
1. Add frontmatter to any new Markdown file under `aix/`.
2. When editing existing Markdown under `aix/`, add frontmatter if missing.
3. For mounted projects, add frontmatter to Markdown files that are part of the curated AIX surface (tooling, specs, or agent-facing utilities).
4. Keep metadata short; avoid prose.
5. Keep values deterministic and human-auditable.
6. Never add or expect frontmatter in vendor or build output folders.

## Open Questions
- Should we allow a `schemaVersion` field once tooling consumes this consistently?
