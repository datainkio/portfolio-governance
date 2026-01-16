# Example: Mounted Project AIX Audit Report (MP subset)

## Classification

- Intent: mounted-project AIX audit (report-only)
- Module: analyst

## Summary

- Mounted project: `/frontend`
- Probe subset: `MP` (MP1–MP5)
- Discovery confidence: `medium`
- Audit output destination: `docs/ai/audits/`

## Scores (0–5)

- FRA: 3.5
- CR: 4.0
- HF: 4.5
- TTUO: 3.5
- CUS: 4.0
- Overall (avg): 3.9 (band: good)

## Findings

### F-001 — Routing ambiguity risk (medium)

- Evidence: project contains a `.github/agents/` directory.
- Impact: increases chance of agent-selection ambiguity in multi-root workspaces.
- Recommendation: deconflict by relocating agents to docs (preserve as legacy reference), or disable exposure.

### F-002 — Missing manifest (high for new mounts)

- Evidence: no `/project-root/aix.manifest.yaml` found.
- Impact: discovery is best-effort; output destinations and validation commands require guessing.
- Recommendation: create root manifest with at least `paths.auditsDir` and `validation.commands`.

## Recommendations (prioritized)

1) Create `/project-root/aix.manifest.yaml` (category: manifest)
2) Ensure a single AIX entrypoint exists (e.g., `docs/ai/START_HERE.md`) (category: docs)
3) Add/verify `.gitignore` rules for generated bundles/build outputs (category: ignore hygiene)

## Patch plan (dry-run) — not applied

Planned changes (allowlist only):

- Create `aix.manifest.yaml`
- Create `docs/ai/audits/` (if missing)

Rollback notes:

- Delete `aix.manifest.yaml` to revert manifest creation.
- Remove `docs/ai/audits/` only if empty and explicitly desired.

## Post-change validation (example)

If auto-fix is applied, re-run MP subset and include a delta summary like:

- FRA +0.5, CR +0.0, HF +0.0, TTUO +0.5, CUS +0.0
- Overall +0.2 (good → good)
- Gates: HF PASS, Safety PASS, TTUO PASS

## Assumptions

- `/frontend` is writable.
- No product source files are edited in report-only mode.

## Next actions

- Create `/project-root/aix.manifest.yaml` from `docs/runbooks/aix.manifest.template.yaml`.
- Re-run report-only audit to generate a baseline snapshot.
