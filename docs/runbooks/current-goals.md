# Runbook: Updating `current-goals.md`

## Purpose

`context/current-goals.md` is the **single-source-of-truth for what matters right now**.

This runbook helps you decide *when* to update it and provides lightweight automation hooks.

## Update Triggers (Human)

Update `current-goals.md` when any of the following happens:

### 1) A goal completed, stalled, or changed shape
- A “Now” item is done → remove it or move the durable part into `specs/`.
- A “Now” item stalled due to a blocker → move to “Not Now” and note the blocker briefly.
- A “Next” item becomes urgent → promote it into “Now”.

### 2) You created new “operational artifacts”
If you produced new audits/evaluations/logs (especially under `docs/logs/`), update goals to reflect:
- What you learned
- What changed in priority
- What the next evidence loop should measure

### 3) A new decision or constraint was added
If you add/modify:
- `docs/decisions/*`
- `context/*`
- `specs/*`

…then update goals so “Now/Next” reflect the new reality.

### 4) You notice drift
Drift signals:
- “Now” includes more than 7 bullets
- A goal is phrased as an implementation plan (too detailed)
- The file reads like a backlog instead of priorities

## Update Cadence (Minimum)

Pick one cadence and stick to it:

- **Daily (lightweight):** update only the “Last updated” date + tweak 1–2 bullets
- **Weekly (recommended):** refresh “Now/Next/Not Now” based on what actually happened
- **Milestone-based:** update whenever you ship a feature, finish a doc effort, or change direction

## Automation: `current-goals-check`

Use the checker to decide if an update is recommended based on drift signals (age, changes to context/specs/decisions/logs, and git status).

- Preferred (VS Code): run the task **Check Current Goals**

- Run: `node scripts/current-goals-check.mjs`
- Stricter: `node scripts/current-goals-check.mjs --maxAgeDays 3`
- CI mode: `node scripts/current-goals-check.mjs --fail-on-update --maxAgeDays 14`

## Editing Guidelines

Keep it short:
- 3–7 bullets per section
- Prefer outcomes and priorities over steps
- Promote stable/durable goals into `specs/` (and link from the goal if helpful)

## Optional Practice: “goal diffs”

When you update goals, add a 1–3 line note in a dated log entry under `docs/logs/` describing:
- What changed
- Why it changed
- What you’re measuring next
