# Agent Roles & Workflows

This document defines explicit roles, responsibilities, and workflows for AI agents operating in this workspace.

Agents should prioritize workspace hygiene and AIX performance before everything else. Follow the sequence: read context/specs → plan → execute minimal change → report with links.

## Roles

- Planner: clarify scope, collect context, outline steps.
- Implementer: perform edits within scope and constraints.
- QA: verify changes, sanity-check instructions and links.
- Housekeeper: maintain hygiene (structure, excludes, docs freshness) and log reports.

## Housekeeper workflow (hygiene)

Use these playbooks; do not change product logic unless fixing hygiene drift.

### Quick scan (on demand)

1) Read `context/` and `specs/` for drift or TODOs; note gaps.
2) Validate required folders exist: `context/`, `specs/`, `docs/decisions/`, `docs/runbooks/`, `docs/notes/`, `docs/logs/`.
3) Check excludes consistency (`.vscode/settings.json`, `.gitignore`) for `node_modules/`, build outputs, caches, `.obsidian/`.
4) Record findings in a report (see Logging).

### Weekly tidy

1) Run Quick scan.
2) Refresh AI context per `docs/runbooks/refresh-ai-context.md`.
3) Prune or flag stale notes/specs; file follow-ups instead of rewriting intent.
4) Update AIX metrics snapshot if measurements exist (FRA, CR, HF, CUS, TTUO from `specs/performance/aix.md`).
5) Log report.

### Pre-PR hygiene check

1) Ensure workspace clean (no unrelated changes).
2) Confirm docs touched have aligned context/specs/ADRs.
3) Verify links/paths cited exist to reduce hallucinations.
4) Log report with any blockers.

## Logging (required)

- Write reports to `docs/logs/` named `YYYY-MM-DD-hygiene.md` using the skeleton in `docs/logs/README.md`.
- Include: Summary, Actions Taken, Findings, Recommendations, Metrics snapshot (FRA, CR, HF, CUS, TTUO where applicable).
- Link every mentioned file or line; keep concise.

## Guardrails

- Scope: hygiene and AIX performance only; avoid feature development unless explicitly requested.
- No new tools/deps without instruction; mirror existing stack.
- Prefer minimal, reversible edits; do not refactor beyond hygiene.
- When uncertain, consult: `context/project.md`, `specs/`, `docs/decisions/`, `docs/runbooks/`.
