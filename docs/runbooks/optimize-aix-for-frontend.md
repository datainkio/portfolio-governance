# Runbook: Optimize AIX for /frontend (Mounted Project)

## When to use

- Copilot/Concierge is misrouting work in `/frontend`.
- Onboarding a new contributor to the multi-root workspace.
- You want a baseline and a measured before/after improvement.

## Preconditions

- `/frontend` is mounted in the workspace alongside the scaffold.
- You have write access to the `/frontend` repo.

## Step 0 — Create the manifest (DX first)

Goal: make discovery deterministic and reduce onboarding friction.

1) In the mounted project root, create `aix.manifest.yaml`.
2) Start with the scaffold template at `docs/runbooks/aix.manifest.template.yaml`.
3) Minimal recommended fields for `/frontend`:

- `paths.auditsDir: "docs/ai/audits"`
- `entrypoints.startHere: "docs/ai/START_HERE.md"` (if present)
- `validation.commands`: include `npm run -s format:check` and a build smoke command if stable

## Step 1 — Run a report-only audit (baseline)

Goal: produce an AIX audit report + snapshot without changing files.

Expected outputs (default):

- `/frontend/docs/ai/audits/<timestamp>--aix-audit--MP.md`
- `/frontend/docs/ai/audits/<timestamp>--aix-snapshot--MP.json`

Checklist:

- Confirm discovery confidence is at least `medium`.
- Confirm allowlist/denylist summary is correct.
- Confirm MP1–MP5 probe subset was used.

## Step 2 — Choose top 1–3 recommendations

Prioritize changes that improve:

- entrypoint clarity (single “START HERE”)
- prompt/module discoverability (`.copilot/prompts/index.md`)
- agent-selection ambiguity reduction (avoid active `.github/agents` in mounted projects)
- noise reduction (`.gitignore` for generated bundles/build outputs)

## Step 3 — Optional: dry-run auto-fix

Goal: preview changes and rollback notes before applying.

Checklist:

- Dry-run includes file list + diff preview + rollback notes.
- No denylisted paths appear in the plan.
- If discovery confidence is `low`, the only offered fix should be “create manifest”.

## Step 4 — Apply selected fixes

Goal: apply only the subset you accept.

Checklist:

- Apply-selected (not apply-all) for the first pass.
- Confirm rollback notes are captured in the report.

## Step 5 — Re-score and validate progress

Goal: quantify improvement.

Expected:

- new snapshot + delta summary in the audit report
- pass gates: HF, Safety, TTUO

If results are inconclusive:

- Increase probe count (e.g., add 5 more prompts) but keep MP1–MP5 unchanged for comparability.

## Step 6 — Maintain (monthly or when quality drops)

Goal: detect drift.

- Run report-only audit.
- Compare to baseline (or previous snapshot).
- Prune duplicated/contradictory AIX surfaces.

## Edge cases

- **Multiple mounted projects in one workspace**: explicitly specify which project root is being audited; do not infer if ambiguous.
- **No `aix.manifest.yaml` yet**: run report-only best-effort discovery, but prefer creating `aix.manifest.yaml` before any broader auto-fix.
- **Both root and `docs/ai` manifests exist**: root `aix.manifest.yaml` takes precedence; remove/merge the `docs/ai` copy only if explicitly requested.
- **Monorepo layouts**: set `paths.*` and `entrypoints.*` in the manifest to point at the correct package/subproject.
- **Repo is read-only / no write access**: produce report-only output and store artifacts under the scaffold (or provide copy/paste content), but do not attempt auto-fix.
- **Project uses a different package manager**: declare validation commands in `aix.manifest.yaml` (e.g., `pnpm -s lint`, `yarn test`).
- **Conflicting `.github/agents` exposure**: treat as a routing-ambiguity risk; recommend deconfliction by relocation + preserving legacy references.

## Notes specific to this workspace

- `/frontend` previously had Nunjucks formatting issues surfaced by `npm run -s format:check`; treat those as project-local issues and do not auto-fix product templates unless explicitly requested.
