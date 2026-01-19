# ADR 0003 — Context Freshness Gate (Sidecar + Deterministic Drift Scoring)

- **Status:** accepted
- **Date:** 2026-01-18

## Context

This workspace relies on `/context` (plus `/specs`) as the canonical reference for both humans and AI agents.

As implementation work progresses (especially across mounted/sibling repos like `../frontend`), the risk is that `/context` becomes stale:

- Goals/constraints/decisions stop matching reality.
- Agents infer outdated intent and propose incorrect changes.
- Humans lose confidence in the workspace’s “source of truth”.

We want a low-friction mechanism that:

- Detects when drift has accumulated beyond a threshold.
- Prompts for review at the right time (commit-time), without requiring ongoing background watchers.
- Remains deterministic and fast.

## Decision

1. **Track context drift baselines explicitly** in `context/drift-baseline.json`.
   - Baseline stores `{ baselineHash, branch, notes }` and is set intentionally (no timestamps).
   - The baseline is advanced via `scripts/update-context-freshness.mjs --set-baseline` when drift is accepted.

2. **Compute drift deterministically** using git diff signals only (no timestamps).
   - Script: `scripts/context-refresh.mjs`
   - Baseline: resolved git hash from `context/drift-baseline.json` or default branch.
   - Signals: scoped to context/specs/docs; weighted by criticality and semantic type.

3. **Enforce drift thresholds at commit/CI time**.
   - Gate entrypoint: `scripts/update-context-freshness.mjs --fail-on-threshold` or `context-refresh` with fail=warn.
   - Hook location: `.githooks/pre-commit` with `core.hooksPath=.githooks` (when enabled).

4. **Include cross-repo drift signals from the sibling frontend repo**.
   - Watch root: `../frontend` (bounded and ignore-noisy directories).
   - Add deterministic “signal strength” bonuses for changes in:
     - `njk/_pages/`, `njk/_includes/`
     - `js/choreography/`
     - `eleventy/`, `.eleventy.js`, `.eleventyignore`
     - `styles/`

5. **Gate frontend commits by delegating to the AIX gate**.
   - Frontend hook runs the AIX gate via `AIX_ROOT` (defaults to `../aix`).

## Rationale

- **Determinism**: avoids false positives/negatives and reduces ambiguity compared to semantic/LLM-based “freshness”.
- **Low friction**: commit-time enforcement is naturally colocated with “recording a review” and “capturing state”.
- **Cross-repo reality**: frontend work often changes what goals/decisions/constraints mean; the drift model should see it.
- **DX trade-off accepted**: when a hook blocks a commit, VS Code’s Source Control UI may show a modal dialog. This is acceptable for now; messaging should remain short and actionable.

## Consequences

- Commits can be blocked when drift exceeds the threshold; developers may need to run the guided refresh workflow.
- The sidecar file becomes part of normal commits (it is intentionally staged by the hook).
- “Mark reviewed” exists as a workflow to reset baseline without editing meta lines in context files.

## Operational notes

- Run the checker manually:
   - `node scripts/context-refresh.mjs --warn-threshold 10 --fail-threshold 10`
- Guided refresh workflow:
   - `node scripts/context-refresh.mjs --open`
- Accept baseline after review:
   - `node scripts/update-context-freshness.mjs --set-baseline HEAD --note "reason"`
