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

1. **Track context review freshness in a sidecar** at `context/.freshness.json`.
   - Each tracked context file records `{ reviewedAt, contentHash }`.
   - The sidecar is updated automatically by repo-managed git hooks.

2. **Compute drift deterministically** using local filesystem/git signals.
   - Script: `scripts/context-freshness-check.mjs`
   - Baseline: sidecar `reviewedAt` (strict mode can require the sidecar).
   - Signals: recently modified files under configured watch roots since baseline.

3. **Enforce drift thresholds at commit time**.
   - Hook entrypoint: `scripts/update-context-freshness.mjs --fail-on-threshold`
   - Hook location: `.githooks/pre-commit` with `core.hooksPath=.githooks`

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
  - `node scripts/context-freshness-check.mjs --require-sidecar --maxAgeDays 14`
- Guided refresh workflow:
  - `node scripts/context-refresh.mjs --open`
- Record a review without editing context content:
  - `node scripts/update-context-freshness.mjs --mark-reviewed`
