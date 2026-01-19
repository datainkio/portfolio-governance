# Context Drift Without Timestamps

- **Title:** Remove timestamp reliance from context drift
- **Owner(s):** Russell
- **Status:** draft
- **Last reviewed:** 2026-01-18
- **Related:** specs/ai/domain-agent-probes.md, docs/agents.md, scripts/context-refresh.mjs, scripts/context-drift-watch.mjs, scripts/update-context-freshness.mjs, scripts/pre-pr-check.mjs

## Purpose
Define the contract for context drift detection that relies only on deterministic drift scoring (diff- and semantics-based), eliminating any dependence on user-maintained timestamps.

## Scope
- Applies to AIX context freshness and drift tooling in this repo (CLI scripts, CI checks, sidecar data).
- Covers baseline selection, scoring, reporting, CI gating, and user workflows to accept new baselines.
- Excludes broader repo hygiene tasks and unrelated telemetry.

## Non-goals
- Do not reintroduce or fallback to timestamps in any path.
- Do not change the meaning of existing drift scores other than clarifying thresholds and baseline handling.
- Do not add external services or SaaS dependencies.

## Design Requirements
- **Timestamp-free:** No logic branches on file timestamps or `maxAgeDays` parameters.
- **Score-only gating:** All checks use drift score vs thresholds; failure/warn gates depend solely on score.
- **Deterministic baselines:** Baseline resolved from Git references, never clock time.
- **Explicit acceptance:** Advancing the baseline is an intentional action (`--set-baseline`), not implicit.
- **File criticality-aware:** High-importance context (constraints, decisions, goals) carries higher weight.
- **Composable:** Works for both local working trees and CI (clean checkout). No network calls beyond `git`.

## Terminology
- **Baseline:** Git commit hash that represents the accepted context state.
- **Working set:** Current checkout (dirty or clean) being evaluated.
- **Drift score:** Weighted aggregate of per-file scores comparing working set vs baseline.

## Baseline Resolution
Order of precedence (first match wins):
1) CLI flag `--baseline <hash>`
2) Baseline file `context/drift-baseline.json` with shape:
   ```json
   {
     "baselineHash": "<git-hash>",
     "branch": "main",
     "notes": "why this baseline was accepted"
   }
   ```
3) Default branch HEAD (configurable; default `origin/main`).

Validation:
- Fail if resolved baseline hash is missing locally; instruct to `git fetch`.
- No fallback to timestamps if baseline is absent; user must set one explicitly or fetch default branch.

## Drift Scoring Model
Per-file score combines change magnitude, semantic sensitivity, and file criticality.

Formula:
$$DriftScore = \sum_{i=1}^{n} w_{criticality,i} \cdot w_{semantic,i} \cdot m_i$$
- $m_i$: normalized magnitude of change for file $i$ (e.g., diff lines scaled to 0-1 cap).
- $w_{criticality,i}$: weight by file class (e.g., constraints > decisions > goals > notes > misc).
- $w_{semantic,i}$: multiplier for semantic changes (e.g., structural edits > wording tweaks).

Suggested weights (tunable, but must be codified and unit-tested):
- Criticality: constraints 1.5, decisions 1.3, goals 1.2, project/context summaries 1.0, notes 0.8.
- Semantic: structural edit 1.3, content edit 1.0, copyedit-only 0.7.
- Magnitude cap: clamp $m_i$ to 1.0 to bound extreme diffs.
- Criticality weights live in a shared map across repos; per-repo overrides are unnecessary unless evidence shows divergence is required.

Output:
- Per-file scores and reasons (magnitude bucket, semantic bucket, weights applied).
- Aggregate score (sum) used for gating.

## Tool Behavior Changes
### Common
- Remove `maxAgeDays` and any timestamp references.
- Add `--baseline <hash>` and `--set-baseline` (writes `context/drift-baseline.json` with resolved hash and optional `--note`).
- Add `--warn-threshold <n>` and `--fail-threshold <n>` (defaults defined in config section).

### `scripts/context-refresh.mjs`
- Compute drift score vs resolved baseline (no timestamp or sidecar requirements).
- Exit codes: 0 below warn; 1 when aggregate is between warn/fail; 2 when at/above fail.
- Output: top contributors ordered by score, aggregate, baseline hash, suggested `--set-baseline` command when accepting drift.

### `scripts/context-drift-watch.mjs`
- Long-form report: per-file deltas, weights applied, remediation suggestions ordered by score contribution.
- Supports `--json` for machine consumption (no timestamps in payload).

### `scripts/update-context-freshness.mjs`
- When `--set-baseline` provided: write `context/drift-baseline.json` with selected hash and optional note; recalc scores to confirm 0 drift.
- Without `--set-baseline`: only reports current scores; no timestamp writes.

### `scripts/pre-pr-check.mjs`
- Replace freshness gate with drift-score gate using shared helper.
- CI defaults: warn threshold 10, fail threshold 20 (maintain these defaults unless backtesting shows clear benefit to change).

## Data and Sidecar
- `context/drift-baseline.json` (authoritative baseline; no timestamps).
- Optional cache file: `context/.drift-cache.json` containing last computed per-file scores keyed by baseline hash and working tree hash for speed; cache invalidated by file mtime but not surfaced to user.
- Reports should not show timestamps; show hashes and score numbers only.

## UX and Messaging
- When drift > warn: show actionable list ordered by score impact (file path, reason buckets, score).
- When user wants to accept drift: show exact command, e.g., `node scripts/update-context-freshness.mjs --set-baseline HEAD --note "accepted post-PR merge"`.
- Never instruct user to edit timestamps.

## Migration Plan
1) Remove timestamp parameters and code paths; add baseline resolver + score-only gating.
2) Introduce `context/drift-baseline.json` template (added on first `--set-baseline`).
3) Update CI configs and docs to use `--warn-threshold/--fail-threshold` instead of `--maxAgeDays`.
4) Backtest thresholds on recent PRs; adjust defaults; add unit tests for scoring and baseline resolution.
5) Document workflow in docs/agents.md and runbooks (no timestamp steps).

## Acceptance Criteria
- No script accepts or checks timestamps; `maxAgeDays` flag removed across tools/CI.
- Baseline resolution follows precedence and fails loudly if absent/unfetchable.
- Drift report shows per-file scores, aggregate score, baseline hash, and acceptance command.
- CI gates use score thresholds only and are configurable via flags/env.
- Unit tests cover: baseline selection, scoring buckets, threshold gating, `--set-baseline` write and re-evaluation.

## Decisions on prior questions
- Threshold defaults stay at warn 10 / fail 20; adjust only when backtesting shows measurable accuracy gains.
- Semantic classification must prioritize accuracy; begin with deterministic heuristics and adopt offline NLP only if it materially improves correctness without external dependencies.
- A shared criticality-weight map is sufficient; avoid per-repo duplication unless future data shows divergence is necessary.
