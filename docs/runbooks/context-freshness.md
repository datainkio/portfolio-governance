# Runbook: Context Freshness & Guided Refresh

## Tools

### 1) Check overall context drift (no timestamps)

- VS Code task: **Check Context Drift (All)**
- CLI: `node scripts/context-refresh.mjs --warn-threshold 10 --fail-threshold 20`

CI-style hard fail at the warn threshold:

- `node scripts/context-refresh.mjs --warn-threshold 10 --fail-threshold 10`

### 2) Guided refresh (drift report + open files)

- VS Code task: **Refresh Context (Guided)**
- CLI: `node scripts/context-refresh.mjs --open`

### 3) Manage drift baselines

- Show current drift vs baseline: `node scripts/update-context-freshness.mjs`
- Accept current state as baseline: `node scripts/update-context-freshness.mjs --set-baseline HEAD --note "why"`
- Adjust thresholds: add `--warn-threshold` / `--fail-threshold`

Notes:

- Baselines live in `context/drift-baseline.json` and are hash-based, not timestamp-based.
- Hooks should not write or rely on `Last updated:` lines; drift scoring drives gating.

If you reviewed context and decided no content changes were needed, record the review without editing context files:

- VS Code task: **Mark Context Reviewed (Sidecar)**
- CLI: `node scripts/update-context-freshness.mjs --mark-reviewed`

How it works:

- When you commit changes to any of the context files, the hook runs `scripts/update-context-freshness.mjs`.
- It writes/updates `context/.freshness.json` and stages it automatically.
- You should not manually edit timestamps or the sidecar.

Commit blocking:

- The pre-commit hook also runs a drift threshold check and will fail the commit when drift exceeds the configured threshold.
- Bypass (use sparingly): `git commit --no-verify`

VS Code UI notes:

- When committing via the VS Code Source Control UI, hook output is typically shown in **Output → Git** (not the integrated terminal).
- If the commit is blocked, VS Code will surface the failure as a commit error.

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

## Expected outputs / checks

After refreshing:
- `context-refresh` returns a drift score below warn threshold
- `current-goals.md` stays short (3–7 bullets per section)
- `constraints.md` remains workspace-level; project-specific constraints are linked
- `decisions.md` lists current accepted ADRs and links to the canonical ADR files

## Rollback / undo

- Revert the context file(s) in git.
- If you used `--touch` accidentally, revert just the timestamp line.

## Troubleshooting

### Drift score seems too high

- Check which files dominate the score (top contributors printed by `context-refresh`).
- Lower thresholds only after backtesting on recent changes; defaults are warn=10 / fail=20.

## Comms template

- "Refreshed workspace context: goals/constraints/decisions reviewed and updated. Ran context freshness check; drift resolved."