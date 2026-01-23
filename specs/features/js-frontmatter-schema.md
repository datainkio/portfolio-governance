# JS Frontmatter Schema (AIX Hygiene)

- **Title:** JS Frontmatter Schema (AIX Hygiene)
- **Owner(s):** AIX maintainers
- **Status:** draft
- **Scope:** JavaScript files under `aix/` (scripts, utilities, spec assets) and mounted projects (e.g., `frontend/`, `backend/`) for any JS intended to be part of the curated AIX surface. Ignore vendor files and build outputs (e.g., `node_modules/`, `_site/`, `.sanity/`, `dist/`, `vendor/`).
- **Links:** [context/constraints.md](../../context/constraints.md), [context/current-goals.md](../../context/current-goals.md), [specs/features/file-aix-hygiene.md](file-aix-hygiene.md)

## Goals
- Give AIX a fast, deterministic way to understand JS file intent without reading the full file.
- Standardize metadata so hygiene tools and agents can prioritize what to read or ignore.
- Keep metadata light, non-invasive, and safe (no behavior changes).

## Non-Goals
- Not a runtime config system.
- Not a replacement for README/spec documentation.
- No timestamps or freshness signals (use git metadata instead).

## Format
- Use YAML frontmatter inside a top-of-file block comment.
- The frontmatter block must be the **first non-empty content** in the file, except for an optional shebang.
- Delimiters are `---` lines inside the block comment.

### Canonical wrapper
```js
/**
 * ---
 * aix:
 *   id: aix.scripts.example
 *   role: Short, concrete description of what this file does.
 *   status: draft
 *   surface: internal
 * ---
 */
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
- `aix.scope` (enum): `aix | frontend | backend | shared`.
- `aix.runtime` (enum): `node | browser | shared`.
- `aix.dependsOn` (string[]): notable dependencies or files.
- `aix.affects` (string[]): affected areas (e.g. `drift`, `specs`, `docs`).
- `aix.outputs` (string[]): outputs or artifacts created.
- `aix.perf` (object):
  - `readPriority` (enum): `high | medium | low`.
  - `cacheSafe` (boolean): safe to cache in curated context.
  - `critical` (boolean): impacts AIX stability or scoring.
- `aix.notes` (string): short clarifying note (1–2 sentences max).

## Parsing rules
- Only the first block comment is considered.
- If the block contains `---` start/end lines, parse YAML between them.
- Ignore malformed YAML and treat the file as having no frontmatter.
- Do not include secrets, tokens, or operational credentials.
- Skip vendor and build output paths entirely (same as repo ignore rules).

## Examples

### `frontend/specs/animation/motion.tokens.js`
```js
/**
 * ---
 * aix:
 *   id: frontend.specs.animation.motion.tokens
 *   role: Shared motion tokens for frontend choreography and motion tooling.
 *   status: stable
 *   surface: internal
 *   owner: Frontend
 *   tags:
 *     - motion
 *     - tokens
 *     - animation
 *   scope: frontend
 *   runtime: shared
 *   perf:
 *     readPriority: low
 *     cacheSafe: true
 *     critical: false
 * ---
 */
```

### `aix/scripts/lib/drift.js`
```js
/**
 * ---
 * aix:
 *   id: aix.scripts.drift
 *   role: Compute drift scoring for context and specs.
 *   status: stable
 *   surface: internal
 *   owner: AIX
 *   tags:
 *     - drift
 *     - metrics
 *     - git
 *   scope: aix
 *   runtime: node
 *   perf:
 *     readPriority: high
 *     cacheSafe: true
 *     critical: true
 * ---
 */
```

## Adoption checklist
1. Add frontmatter to any new JS file under `aix/`.
2. When editing existing JS under `aix/`, add frontmatter if missing.
3. For mounted projects, add frontmatter to JS files that are part of the curated AIX surface (tooling, specs, or agent-facing utilities).
4. Keep metadata short; avoid prose.
5. Keep values deterministic and human-auditable.
6. Never add or expect frontmatter in vendor or build output folders.

## Open Questions
- Should we allow a `schemaVersion` field once tooling consumes this consistently?
