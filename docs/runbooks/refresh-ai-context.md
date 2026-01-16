# Runbook: Refresh AI Context & Indexes

- **Owner:** DX Team
- **Last validated:** 2026-01-13
- **Preconditions:** Local repo clean; access to main branch; editors honor `.vscode/settings.json` excludes.

## Steps
1) Pull latest: `git pull origin main`.
2) Review for truth updates: scan `/context` and `/specs` for changes; ensure ADRs in `/docs/decisions` reflect any new choices.
3) Sync derived context (if used): regenerate any `.copilot/context` or agent cache files to mirror `/context` and `/specs` summaries; include drift/freshness sweep notes.
4) Validate structure: confirm required folders exist (`/context`, `/specs`, `/docs/decisions`, `/docs/runbooks`, `/docs/notes`, `/docs/logs`), and excludes cover `node_modules`, build outputs, `.obsidian`, caches.
5) Smoke test agent hints: open README files in `/context`, `/specs`, `/docs/decisions`, `/docs/runbooks`; ensure instructions are current and non-contradictory.
6) Verify build/dev commands are current: align referenced commands in README/runbooks/tasks with the latest scripts (frontend/backends if present, or workspace tasks if single-root).
7) Log AIX snapshot post-refresh: run a small probe set, score FRA/CR/HF/TTUO/CUS per `specs/performance/aix.md`, and add a dated entry under `docs/logs/`.
8) Commit and push: include ADR/runbook updates and the AIX snapshot if made.

## Expected Outputs & Checks
- Excludes remain in `.vscode/settings.json` and `.gitignore` and match the scaffold goals.
- ADRs align with `/context` and `/specs`; no conflicting guidance across folders.
- Agents see the latest context (regenerated summaries/caches where applicable).
- Referenced build/dev commands match current scripts/tasks.

## Rollback / Undo
- If regenerated context introduces issues, revert the cache/snapshot files and reopen the last known good versions from main.
- If folder structure was altered incorrectly, restore from git and re-apply the scaffold layout.

## Comms Template
- "Refreshed AI context/indexes for vitaixmen. Synced `/context`, `/specs`, ADRs, runbooks; validated excludes. Please pull main to pick up updates."
