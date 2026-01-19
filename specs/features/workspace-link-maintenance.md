# Feature Spec

- **Title:** Workspace Link Maintenance (Link Updater)
- **Owner(s):** vitaixmen maintainers (Russell / @datainkio)
- **Status:** draft
- **Last reviewed:** 2026-01-19
- **Scope:** Markdown link targets across aix plus sibling repos (`../frontend`, `../backend`) for specs, docs, context, and runbooks; excludes generated artifacts and vendor folders.
- **Links:** context `/context/project.md`, goals `/context/current-goals.md`, agent map `/docs/agents.md`, file hygiene `/specs/features/file-aix-hygiene.md`

## Goals & Non-Goals

### Goals
- Automatically update all workspace references to a file when it is created, renamed, moved, or deleted.
- Minimize manual link maintenance for agents and humans by providing a fast, guided fix.
- Keep AIX drift-neutral by respecting ignore lists and canonical link patterns (repo-root relative paths).
- Provide a one-click entry point in VS Code (task + action button) to run the updater with prompts.

### Non-Goals
- Not a general code refactor tool; does not rewrite import paths in source files.
- Does not alter auto-generated outputs (`_site`, build artifacts) or vendored dependencies.
- Does not enforce content style; only maintains link targets.

## User Stories & Journeys

- **US1: Rename/move** — As a maintainer, I rename a spec; I trigger the updater and all Markdown links across aix/frontend/backend repoint to the new path, with a summary of changed files.
- **US2: Delete** — As a maintainer, I delete a doc; I run the updater with `--delete` and links convert to plain text (no dead link), with a report of any remaining missing references.
- **US3: Add** — As a contributor adding a new doc, I run the updater in “ensure-linked” mode to insert root-relative links into the nearest index files I select.
- **US4: Agent assist** — As an agent, I can invoke the VS Code task/action button with provided paths and get an apply-ready diff without manual path hunting.

## Functional Requirements

- **FR1: Input modes** — Support operations `rename/move` (requires `--from` and `--to`), `delete` (requires `--from`), and `add` (requires `--to`). Optional `--ensure-index` flag can be used to add links to selected index files.
- **FR2: Scope & ignores** — Scan only Markdown-family files (`.md`, `.mdx`) plus workspace maps/index JSON where paths are stored (e.g., `.code-workspace`, `copilot-agents.json`), across `aix/`, `../frontend/`, and `../backend/`. Exclude `.git`, `.obsidian`, `node_modules`, `.next`, `dist`, `_site`, `coverage`, `cache-export`, and other generated outputs.
- **FR3: Link rewrite rules** — Update link destinations while preserving link text and anchors; prefer repo-root relative paths (e.g., `/specs/features/foo.md`). Maintain hash fragments when present; do not change display text unless `--delete` is used.
- **FR4: Delete handling** — For `--delete`, replace `[text](old)` with `text` and emit a warning in the summary for each removed target. Optional `--marker` can append `(removed)` if requested.
- **FR5: Dry-run default** — Default run is dry-run: print a table of proposed edits (file, count, preview) and exit non-zero if changes would occur. `--apply` writes edits to disk.
- **FR6: Safety** — Do not modify binary files. Validate that `--to` exists (unless `--delete`); warn and skip if `--from` is not referenced. Preserve file formatting (no auto-format). Abort if attempting to write outside allowed roots.
- **FR7: Logging & report** — Emit a structured summary: operations attempted, files inspected, files changed, links updated/removed, skipped paths, and remaining unresolved links. Provide optional JSON report (`--report <path>`).
- **FR8: VS Code task** — Add a VS Code task `AIX: Update Workspace Links` that prompts for `from` and `to` paths plus operation (rename/move/add/delete), runs dry-run by default, and offers an apply flag.
- **FR9: Action button** — Add an action button that triggers the above task with a single click; button label should be short (e.g., “Update links”) and visible in the AIX workspace.
- **FR10: Compatibility** — Task must work on macOS and Linux with the repo’s Node version; no external dependencies beyond workspace packages.
- **FR11: Idempotence** — Re-running after apply should produce no further changes (clean dry-run).

## Acceptance Criteria

- **AC1:** Given a renamed spec path, running the task with `--from old --to new --apply` updates all Markdown links across `aix/`, `../frontend/`, and `../backend/` that pointed to the old path; rerun dry-run shows zero pending changes.
- **AC2:** Given a deleted doc and `--delete`, links are converted to plain text and the summary lists removed targets; no dead Markdown links to the removed path remain in scoped folders.
- **AC3:** Ignore set is respected: no edits occur under excluded directories (e.g., `_site`, `node_modules`).
- **AC4:** VS Code task appears in the Command Palette and runs end-to-end; the action button triggers the task without additional configuration.
- **AC5:** `--report` produces a JSON summary with counts of scanned files, changed files, updated links, removed links, and skips.

## Dependencies & Risks

- **Dependencies:** Node runtime available; workspace permissions to edit sibling repos; existing VS Code Action Buttons extension (or equivalent) installed if required for the button surface.
- **Risks:** Accidental edits outside intended scope if ignore list is incomplete; mitigation: enforce allowed roots and dry-run default. Potential mismatched link styles (relative vs root); mitigation: prefer root-relative rewrites and document patterns. Large scans may be slower; mitigation: allow `--root` filtering for targeted runs.

## Rollout & Analytics

- Implement script and add VS Code task + action button.
- Document usage in `docs/agents.md` or a short runbook under `docs/runbooks/`.
- Optional: add lightweight metric by counting updated links in the JSON report for future trend tracking.

## Decisions

- Prefer repo-root relative link targets for Markdown documents.
- Default to dry-run to avoid accidental writes.
- Treat deletion as link removal (plain text) rather than redirecting to a tombstone page.

## Open Questions

- Should the tool also update navigation structures in MkDocs or other site configs if present?
- Do we need an interactive picker for paths (e.g., quick open) versus text prompts only?
- Should add/ensure-index mode automatically propose indexes to touch based on path heuristics?