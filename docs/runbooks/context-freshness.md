# Runbook: Context Freshness & Guided Refresh

- **Owner:** DX Team
- **Last validated:** 2026-01-17

## Purpose

Keep these workspace-level context files accurate and up to date:

- `context/current-goals.md` (what matters now)
- `context/constraints.md` (hard guardrails)
- `context/decisions.md` (index of accepted ADRs)

Automation should **detect drift and enforce review**, not auto-write goals/constraints/decisions.

## Update triggers (human)

Update the relevant context file when any of these happen:

- A priority changes materially (promote/demote items in `current-goals.md`).
- A new ADR is accepted or an ADR is superseded (update `decisions.md`).
- A new hard constraint appears (update `constraints.md`).
- A new spec becomes the real source of truth (move durable guidance to `specs/`, then simplify context).

## Tools

### 1) Check overall context freshness

- VS Code task: **Check Context Freshness (All)**
- CLI: `node scripts/context-freshness-check.mjs`

CI-friendly:
- `node scripts/context-freshness-check.mjs --fail-on-update --maxAgeDays 14`

Strict CI mode (requires sidecar freshness; ignores `Last updated:` as a baseline):

- `node scripts/context-freshness-check.mjs --require-sidecar --fail-on-update --maxAgeDays 14`

### 2) Guided refresh (drift report + open files)

- VS Code task: **Refresh Context (Guided)**
- CLI: `node scripts/context-refresh.mjs --open`

### 3) Automatic review metadata (git hook)

This workspace tracks **context review freshness** in a sidecar file:

- `context/.freshness.json`

It is updated automatically on commit by a pre-commit hook.

Install the repo-managed hooks once per clone:

- VS Code task: **Install Git Hooks (core.hooksPath)**
- CLI: `node scripts/install-git-hooks.mjs`

Initialize the sidecar once per repo (so strict CI has baselines for all context files):

- VS Code task: **Init Context Freshness Sidecar**
- CLI: `node scripts/update-context-freshness.mjs --init`

How it works:

- When you commit changes to any of the context files, the hook runs `scripts/update-context-freshness.mjs`.
- It writes/updates `context/.freshness.json` and stages it automatically.
- You should not manually edit timestamps or the sidecar.

Commit blocking:

- The pre-commit hook also runs a drift threshold check and will fail the commit when drift exceeds the configured threshold.
- Bypass (use sparingly): `git commit --no-verify`

### Cross-repo drift (frontend work)

Substantial work in the sibling `frontend/` repo can make AIX context stale even if `aix/context/*` wasn’t edited.

This runbook supports that in two ways:

- AIX drift scoring includes recent changes under `../frontend` (build outputs like `frontend/_site` are ignored).
- Optional: gate frontend commits using a frontend pre-commit hook that runs the AIX context gate.

To enable frontend commit gating (once per clone):

- From `frontend/`: run `npm run hooks:install`

If your repo layout differs, set `AIX_ROOT` for the frontend hook (example):

- `AIX_ROOT=/absolute/path/to/aix git commit ...`

This will configure `core.hooksPath=.githooks` in the frontend repo and run the AIX threshold gate during frontend commits.

Optional (legacy; only updates `Last updated:` lines; does not change content):

- Touch recommended files: `node scripts/context-refresh.mjs --touch`
- Touch all context files: `node scripts/context-refresh.mjs --touch-all`

## Expected outputs / checks

After refreshing:

- `context-freshness-check` returns “fresh enough”
- `context/.freshness.json` reflects reviewed context files (updated via git hook)
- `current-goals.md` stays short (3–7 bullets per section)
- `constraints.md` remains workspace-level; project-specific constraints are linked
- `decisions.md` lists current accepted ADRs and links to the canonical ADR files

## Rollback / undo

- Revert the context file(s) in git.
- If you used `--touch` accidentally, revert just the timestamp line.

## Troubleshooting

### The commit hook didn’t update `context/.freshness.json`

Most common causes:

1) Hooks aren’t installed for this clone
	- Check: `git config --get core.hooksPath` (should be `.githooks`)
	- Fix: `node scripts/install-git-hooks.mjs` (or VS Code task **Install Git Hooks (core.hooksPath)**)

2) The context file wasn’t staged
	- The pre-commit updater only runs when one of these is staged:
	  - `context/current-goals.md`
	  - `context/constraints.md`
	  - `context/decisions.md`

3) Hooks were bypassed
	- If you commit with `git commit --no-verify`, hooks will not run.

4) Quick manual verification
	- Stage a context change: `git add context/current-goals.md`
	- Run: `node scripts/update-context-freshness.mjs`
	- Confirm: `git diff --cached --name-only` includes `context/.freshness.json`
	- VS Code task: **Update Context Freshness Sidecar (From Staged)**

## Comms template

- "Refreshed workspace context: goals/constraints/decisions reviewed and updated. Ran context freshness check; drift resolved."