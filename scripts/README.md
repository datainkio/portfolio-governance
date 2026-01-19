# Workspace Scripts

This folder contains small utility scripts used to support development, automation,
and maintenance tasks across the workspace.

Scripts should be safe to run locally, documented inline, and avoid hard-coded paths
when possible. When a script is required for a workflow, it should be referenced from
a task, runbook, or agent workflow.

## Scripts

### agent-ops.mjs

Safe wrapper for common file ops inside mounted projects (open, move, delete, mkdir, touch). Used by VS Code tasks.

### context-drift-watch.mjs

Watches context/specs/docs drift versus the baseline and reports aggregate drift (CI-friendly monitor).

### context-freshness-check.mjs

Computes drift vs baseline (context/specs/docs) and exits non-zero on warn/fail thresholds; used by Pre-PR/CI tasks.

### mounted-project-aix-audit.mjs

Report-only, dependency-free discovery runner that writes timestamped audit artifacts into a mounted project.

- Usage: `node scripts/mounted-project-aix-audit.mjs --project /absolute/path/to/mounted/project --probeSubset MP`
- Output (default): `/project-root/docs/ai/audits/<timestamp>--aix-audit--MP.md` and `/project-root/docs/ai/audits/<timestamp>--aix-snapshot--MP.json`
- Notes:
	- The manifest is optional; if present, its `auditsDir` hint is used when possible.
	- This runner is discovery-only (no LLM scoring) and does not modify existing project files.

### context-refresh.mjs

Drift-guided context refresher that reports the top contributors to context/specs/docs drift using the same scoring model as `context-freshness-check.mjs`.

- Usage: `node scripts/context-refresh.mjs [--warn-threshold N] [--fail-threshold N] [--baseline HASH] [--path GLOB] [--open] [--json]`
- Behavior: computes drift vs `context/drift-baseline.json` (or `origin/main`), marks recommended when aggregate ≥ warn threshold, and optionally opens the top drifted files in VS Code.
- Notes: does not use file timestamps or sidecar reviewedAt; recommendations are purely drift-based.

### current-goals-check.mjs

Checks `context/current-goals.md` freshness and signals updates when goals are stale.

### install-git-hooks.mjs

Installs the repo-managed git hooks (e.g., to refresh context sidecar on commit).

### markdown-link-check.mjs / markdown-link-check-local.mjs

Validates Markdown links (remote-aware vs local-only variants). Used in Pre-PR and docs tasks.

### pre-pr-check.mjs

Aggregates CI-style checks: goals freshness, context drift, markdown links, plus syntax checks for helper scripts.

### update-context-freshness.mjs

Manages drift baselines: compute drift vs baseline or set a new baseline (`context/drift-baseline.json`) with optional note.