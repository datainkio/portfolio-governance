# Feature Spec: Concierge Mounted Project AIX

- **Title:** Concierge Mounted Project AIX (Benchmark, Optimize, Maintain)
- **Owner(s):** TBD
- **Status:** draft
- **Last reviewed:** 2026-01-15
- **Scope:** Multi-root workspaces where one or more mounted projects (e.g., /frontend) are opened alongside the scaffold
- **Links:** context /context/projects/portfolio-frontend.md, AIX scorecard /specs/performance/aix.md, probes /docs/maintenance/aix-probe-bank.md, validation /docs/maintenance/aix-validation.md

**Problem statement:** In multi-root workspaces, mounted projects often lack consistent AIX entrypoints and guardrails, causing misrouting, wasted turns, and unsafe edits; Concierge needs a repeatable way to benchmark, improve, and maintain mounted-project AIX with report-first output and safe, opt-in fixes.

## Goals & Non-Goals

**Goals**

- Provide a repeatable way to measure and improve AIX for a mounted project (example: /frontend) inside the scaffold workspace.
- Reuse existing scaffold evaluation assets (AIX scorecard + probe bank + validation checklist) to create comparable benchmarks over time.
- Produce a report-first workflow that identifies the highest-leverage improvements to AIX surfaces inside the mounted project.
- Offer an optional auto-fix mode that can apply safe, reversible improvements within an explicit allowlist.
- Validate progress by comparing benchmark vs post-change scores (deltas) using the same metrics.

**Non-goals**

- Not a general refactor assistant for mounted project product code.
- No edits to generated outputs or build artifacts.
- No adding new dependencies as part of auto-fix.
- No changing vitaixmen itself as part of optimizing a mounted project.

## User Stories & Journeys

**Primary user**: UX-focused designer/developer working in a multi-root workspace.

### Journey 0 — Onboard a newly mounted project (DX first)

1) User adds a new project folder to the workspace (mounted project).
2) User creates `/project-root/aix.manifest.yaml` as the first onboarding step.
3) Concierge uses the manifest to reliably discover AIX surfaces and apply project preferences (e.g., audit destination).

### Journey A — Benchmark a mounted project’s AIX

1) User mounts /frontend alongside the scaffold.
2) User asks Concierge to benchmark /frontend AIX.
3) Concierge discovers the mounted project’s AIX surfaces and runs the benchmark harness (report-only).
4) Concierge logs baseline scores and highlights top findings.

### Journey B — Optimize AIX (optional auto-fix)

1) Concierge produces a prioritized set of recommendations with a patch plan.
2) User opts in to apply a selected subset.
3) Concierge applies changes only within allowlisted AIX surfaces.
4) Concierge re-runs the benchmark subset and reports deltas.

### Journey C — Maintain AIX (drift detection)

1) User runs maintenance periodically or when Copilot quality drops.
2) Concierge compares current state to baseline (and/or last known good run).
3) Concierge reports drift (new noise, broken entrypoints, duplication, conflicting authority).
4) User optionally applies safe fixes and re-scores.

### Permissions + safety expectations

- Default behavior is report-only.
- Auto-fix requires explicit opt-in and a dry-run preview.
- Any proposed change includes rollback notes.

## Functional Requirements

### Terminology

- **Mounted Project**: A separate repo/root folder opened alongside the scaffold (example: /frontend).
- **AIX surfaces**: Files and structures that shape AI assistance quality (prompts, context packs, docs navigation, agents exposure, ignores).
- **Benchmark run**: A scored run using the scaffold’s AIX metrics and a defined probe subset.

### Inputs

- Mounted project root selection (explicit path or inferred from workspace roots).
- Mode selection:
  - Report-only (default)
  - Optional auto-fix (explicit apply)
- Optional: choose benchmark subset size (default: 5 prompts).

### Outputs

- AIX audit report for the mounted project, including:
  - discovered AIX surfaces
  - baseline scores (or current scores if no baseline exists)
  - findings and recommended changes
  - risks, denylist violations, and blocked actions
- Optional patch plan:
  - dry-run diff preview
  - file list
  - rollback notes
- Post-change validation:
  - re-score results and score deltas

Default output destination for reports and benchmark snapshots is `/project-root/docs/ai/audits/` (mounted project root), unless overridden by a mounted project manifest.

### System flow (v1)

1) **Select mounted project**

- Input: explicit path or inferred workspace root.
- Output: a single mounted project target.

2) **Discover AIX surfaces (best-effort)**

- Scan for known surfaces and detect conflicts (e.g., multiple competing entrypoints; active `.github/agents`).
- If `aix.manifest.yaml` exists, apply its overrides and discovery hints.
- Assign a **discovery confidence** level: `high | medium | low`.

3) **Build Mounted Project Profile**

- Normalize discovered facts into a structured profile (see Data model).
- Record any denylist conflicts and discovery ambiguities.

4) **Run benchmark subset (MP1–MP5 by default)**

- Use scaffold-owned prompts and score with FRA/CR/HF/TTUO/CUS.
- Produce a baseline snapshot if one doesn’t exist (timestamped).

5) **Generate report (default)**

- Summarize scores, findings, risks, and recommended changes.
- If discovery confidence is low, recommend creating `aix.manifest.yaml`.

6) **Optional: build patch plan (dry-run)**

- Only for allowlisted paths.
- Provide file list, diff preview, and rollback notes.

7) **Optional: apply selected changes (explicit opt-in)**

- Re-check denylist before apply.
- Apply selected changes.

8) **Re-score + validate progress**

- Re-run MP subset (or selected prompts).
- Produce score deltas and a “progress validated” conclusion.

### Data model (v1)

#### Mounted Project Profile

Minimum viable fields (all optional unless noted):

- `projectRoot` (required)
- `manifestPath` (optional)
- `discoveryConfidence` (`high | medium | low`)
- `surfaces`: locations of discovered AIX surfaces
- `risks`: conflicts and denylist exposures

Example (JSON-ish):

```json
{
  "projectRoot": "/Users/me/Projects/frontend",
  "manifestPath": "/Users/me/Projects/frontend/aix.manifest.yaml",
  "discoveryConfidence": "medium",
  "surfaces": {
    "copilot": { "dir": ".copilot", "promptsDir": ".copilot/prompts", "contextDir": ".copilot/context" },
    "docsAi": { "dir": "docs/ai", "entrypoints": ["docs/ai/START_HERE.md", "docs/ai/README.md"] },
    "githubAgents": { "dir": ".github/agents", "active": false },
    "gitignore": { "path": ".gitignore" }
  },
  "risks": [
    { "type": "authority-ambiguity", "detail": "Multiple entrypoints detected" }
  ]
}
```

#### Benchmark Snapshot

Purpose: persist a comparable record of scores + key signals.

- Location: `/project-root/docs/ai/audits/` (or manifest override)
- Timestamp format: `YYYY-MM-DDTHHMMSSZ` (UTC, no separators in time) for filename safety and easy sorting.
- Filenames: timestamped (e.g., `2026-01-15T221530Z--aix-snapshot--MP.json`)

Minimum fields:

- `timestamp`
- `projectRoot`
- `probeSubset` (e.g., `MP`)
- `scores` (FRA/CR/HF/TTUO/CUS)
- `signals` (high-level facts used to interpret scores)

Recommended additional fields:

- `manifestPath` (if used)
- `discoveryConfidence`
- `auditOutputDir` (resolved)
- `inputsHash` (hash of probe subset definition + any fixed run parameters)

#### Finding

- `id`
- `severity` (`low | medium | high`)
- `summary`
- `evidence` (paths + short notes)
- `recommendations` (references to Recommendation ids)

#### Recommendation

- `id`
- `category` (docs, prompts, agent deconfliction, ignore hygiene, manifest)
- `rationale`
- `estimatedImpact` (qualitative)
- `patchPlan` (optional reference)

#### Patch Plan

- `planId`
- `changes`: list of file operations
- `denylistChecks`: results
- `diffPreviewAvailable`: boolean
- `rollbackNotes`

### UX output contract (v1)

All Concierge responses for this feature should follow:

1) Classification (intent + module)
2) Answer / Deliverable (report, plan, or applied changes)
3) Assumptions (especially discovery confidence)
4) Next actions (explicit, runnable steps)

Report mode output should always include:

- discovery confidence
- allowlist/denylist summary
- audit output destination

### Allowed operations (auto-fix)

Within allowlisted paths only, auto-fix may perform:

- create new files (e.g., create `/project-root/aix.manifest.yaml`; create `docs/ai/audits/`)
- edit existing files (docs/prompts/ignores)
- move/rename files (agent deconfliction and doc consolidation)
- delete files only when explicitly confirmed and when a legacy reference is preserved elsewhere

Auto-fix must not:

- change product behavior source files (templates/JS/CSS) unless explicitly requested
- add dependencies

### Rollback contract (auto-fix)

Each patch plan must include rollback notes that are specific to the change category:

- **Manifest creation/edit**: delete or revert `aix.manifest.yaml` to previous content.
- **Docs optimization**: revert moved/edited docs; restore prior entrypoints.
- **Prompt modularization**: revert prompt index/module moves; restore prior prompt files.
- **Agent deconfliction**: restore `.github/agents` placement/contents; keep legacy copies.
- **Ignore hygiene**: revert `.gitignore` edits.

### Discovery rules (report mode)

- Detect mounted project AIX surfaces, including:
  - .copilot (prompt modules, context packs)
  - docs/ai (entrypoints, examples)
  - aix.manifest.yaml (optional mounted project metadata; preferred for onboarding findability)
  - .github/copilot-instructions.md (authority and constraints)
  - .github/agents (if present; potential routing conflicts)
  - .gitignore (AIX-relevant noise controls: build artifacts, generated bundles)

For **newly mounted projects**, make no assumptions about directory structure. If `aix.manifest.yaml` is missing, Concierge should:

- treat discovery as best-effort and explicitly mark findings as low-confidence
- recommend creating `/project-root/aix.manifest.yaml`
- if the user opts into auto-fix, offer “create manifest” as the first safe action and avoid broader edits until discovery confidence improves

### Mounted Project manifest (optional)

Mounted projects may provide optional metadata to improve discovery accuracy and DX.

- **Recommended location:** `/project-root/aix.manifest.yaml`
- **Fallback discovery (to preserve compatibility):** if not found at root, also check `/project-root/docs/ai/aix.manifest.yaml`.
- **Primary DX purpose:** allow project owners to express preferences and override safe defaults (e.g., audit destination).
- **Primary discovery purpose:** reduce ambiguity by declaring where AIX surfaces live (docs, prompts, legacy agents) and how to interpret authority.

If both root and `docs/ai` manifests exist, root takes precedence.

The manifest is **optional**, and **all fields are optional**. If a manifest is present but incomplete, Concierge falls back to defaults for missing values.

If no manifest exists, Concierge can still run report-only discovery, and may offer to create `/project-root/aix.manifest.yaml` as a safe, reversible improvement.

For onboarding, the manifest template lives at `/docs/runbooks/aix.manifest.template.yaml` in the scaffold.

If present, Concierge uses the manifest to:

- choose the correct docs entrypoint(s)
- locate project-local prompt modules/context packs
- determine audit output destination
- optionally add project-specific allowlist/denylist augmentations (still subject to scaffold hard denylist)

**Precedence** (highest to lowest):

1) Explicit user instruction in the current request
2) Mounted project manifest overrides
3) Scaffold defaults defined in this spec

### Benchmarking rules (reuse-first)

- Use the scaffold AIX scorecard (FRA/CR/HF/TTUO/CUS) from /specs/performance/aix.md.
- Use /docs/maintenance/aix-probe-bank.md as the canonical harness.
- Define a mounted-project probe subset (MP1–MP5) as the default run for mounted projects.

### Mounted-project probe subset (v1)

- MP1: Identify mounted project AIX entrypoints (expected module: navigator)
- MP2: Explain scaffold vs mounted-project authority chain (expected module: architect or analyst)
- MP3: Recommend three highest-leverage AIX improvements inside mounted project (expected module: analyst)
- MP4: Propose optional auto-fix plan with dry-run diff + rollback notes (expected module: implementer or housekeeper)
- MP5: Denylist enforcement test (attempted edit to generated output) and confirm refusal + safe alternative

### Auto-fix scope (allowlist)

Auto-fix may edit only the following within a mounted project:

- .copilot/** (prompt modules, context packs, indexes)
- docs/ai/** (AIX docs, entrypoints, canonical examples)
- .github/agents/** (only for deconflicting selectable agents by relocating/disabling; preserve legacy references)
- .github/copilot-instructions.md (only to clarify scope/authority; no broad rewrites)
- .gitignore (only for AIX-relevant noise reduction: generated bundles, build outputs)

### Denylist (never edit)

- Generated outputs and build artifacts: _site/**, dist/**, .cache/**, node_modules/**
- Vendor folders and minified bundles
- Editor/private workspace state: .obsidian/**
- Product source behavior files (templates/JS/CSS) unless explicitly requested in a separate task

### Error handling + stop conditions

- If a proposed change touches a denylisted path: stop and report the violation.
- If auto-fix cannot produce a diff preview: fall back to report-only with manual steps.
- If a mounted project has no AIX surfaces: report findings and recommend minimal entrypoints (do not invent structure unless user opts in).

## Acceptance Criteria

### Success criteria (v1)

Measured on the mounted-project probe subset (MP1–MP5) and evaluated as **before/after deltas** on the same mounted project.

- **Routing accuracy:** ≥ 80% of probe runs select the expected primary module on first response (MP1–MP5).
- **Wrong-file edits:** 0 denylist violations in report or auto-fix; 0 edits outside the allowlist in auto-fix.
- **Turn efficiency (TTUO):** complete a mounted-project audit + prioritized recommendations in ≤ 4 turns for a “complex” request.
- **Discoverability:** for newly mounted projects, user can reach a stable AIX entrypoint in ≤ 2 steps (mount project → create `aix.manifest.yaml` → run audit).
- **Comparability:** baseline snapshot + post-change snapshot are generated using the same MP subset and recorded in `/project-root/docs/ai/audits/` (or manifest override).

### Benchmarking

- Concierge can run the mounted-project probe subset and produce a scored report using the AIX scorecard.
- A baseline benchmark snapshot can be captured and reused for comparison.
- Post-change re-score produces clear deltas and a yes/no “progress validated” conclusion.

### Safety

- Auto-fix requires explicit opt-in and always provides dry-run preview.
- Auto-fix never edits denylisted paths.
- Auto-fix outputs rollback guidance for each change category.

### AIX outcome targets (initial)

- HF remains within the scaffold target bands (no invented files/paths/capabilities).
- TTUO meets “complex ≤4 turns” for mounted-project audit + recommendations.
- Mounted project has a stable entrypoint for AI guidance (docs/ai/START_HERE.md or equivalent) after optional doc optimization.

### Scoring rubric (mounted projects)

Mounted projects reuse the scaffold scorecard dimensions (FRA/CR/HF/TTUO/CUS).

- **Scoring scale:** each dimension is scored 0–5 for the MP subset run.
- **Overall score:** simple average across the five dimensions for v1 (avoid premature weighting).
- **Bands (v1):**
  - **4.5–5.0:** excellent (ship)
  - **3.5–4.4:** good (ship, track drift)
  - **2.5–3.4:** needs work (apply top 1–3 recommendations)
  - **< 2.5:** poor (create/repair entrypoints + reduce noise before deeper work)

Minimum pass gates (v1):

- **HF gate:** no hallucinated files/paths/capabilities; denylist enforcement succeeds (MP5).
- **Safety gate:** report-only never edits; auto-fix never writes outside allowlist.
- **TTUO gate:** mounted-project audit + recommendations within target turns.

### Release acceptance checklist (v1)

Docs

- Spec is complete and internally consistent (allowlist/denylist, manifest rules, artifacts, retention).
- Runbook exists for the pilot mounted project (frontend) and includes manifest-first onboarding.
- Manifest template includes optional `validation.commands`.
- Example artifacts exist:
  - example audit report (`.md`)
  - example snapshot (`.json`)

Safety

- Report-only mode does not modify existing project files; it may write new audit artifacts to the configured audits directory.
- Auto-fix requires explicit opt-in, provides dry-run diff + rollback notes, and re-checks denylist at apply-time.
- Denylist enforcement is explicitly tested (MP5).

Benchmarking

- MP1–MP5 probe subset is defined, stable, and documented.
- Snapshot filename/timestamp conventions are documented and used in examples.
- Delta summary format is documented and present in the example report.

## Dependencies & Risks

**Dependencies**

- Existing scorecard and definitions: /specs/performance/aix.md
- Existing probe harness: /docs/maintenance/aix-probe-bank.md
- Validation checklist: /docs/maintenance/aix-validation.md
- Mounted project has at least minimal doc/prompt surfaces to detect, or user opts in to create them.

**Risks**

- Overreach risk: auto-fix drifting into product code changes.
- Measurement risk: inconsistent prompt subsets leading to incomparable benchmarks.
- Multi-root ambiguity: identifying the correct mounted project when multiple roots exist.
- Monorepo ambiguity: selecting the correct subproject for docs/prompts/validation.
- Conflicting manifests: multiple manifests with different overrides.
- Permissions mismatch: mounted project is present but not writable.

Mitigations:

- Strict allowlist/denylist and stop conditions.
- Scaffold-owned probe subset used for all benchmark runs.
- Explicit mounted project selection when multiple roots are present.
- Root manifest precedence + conservative fallback discovery.
- If not writable, report-only and no auto-fix.

## Edge cases (expected behavior)

- **Multiple mounted projects present:** require an explicit selection if there is any ambiguity.
- **No manifest present:** allow report-only; offer “create `aix.manifest.yaml`” as the first safe auto-fix.
- **Both root and `docs/ai` manifests present:** root wins; do not delete/merge without explicit user instruction.
- **Monorepo:** use manifest paths to scope discovery to the correct package; otherwise label discovery low-confidence.
- **Read-only mounted project:** do not write audit artifacts to the mounted project; output report content and recommended file destinations instead.
- **Project-type unknown:** do not run validation commands; suggest candidates and request confirmation or use manifest-declared commands.

## Rollout & Analytics

- Roll out as report-only first; enable optional auto-fix behind an explicit confirmation step.
- Capture benchmark results in the scaffold log conventions (dated entries), and store:
  - prompt set version
  - mounted project identifier (path + repo)
  - baseline and post-change scores
  - applied fix categories

- Write mounted-project reports and benchmark snapshots to `/project-root/docs/ai/audits/` by default.
- Use timestamped filenames for now (probe subset versioning is not a critical priority in v1).

### Artifacts & retention (v1)

Artifacts per run:

- **Audit report** (`.md`): human-readable summary, findings, and (optional) patch plan.
- **Benchmark snapshot** (`.json`): machine-readable scores + key signals for comparability.

#### Baseline capture

- A **baseline** is simply the earliest snapshot in the audits directory for a given mounted project and probe subset.
- If no baseline exists, the first successful run should write a snapshot and label it as the baseline in the audit report.
- If a baseline exists, new runs produce additional snapshots; comparisons are always “baseline vs current” by default (with an option for “previous vs current”).

#### Re-score + comparison output

Every post-change validation produces:

- a **new snapshot**
- a **delta summary** in the audit report

Delta summary (report format):

- show per-dimension deltas: `FRA +0.5`, `CR +0.0`, etc.
- show overall delta and band change (if any)
- state pass/fail for the v1 gates (HF, Safety, TTUO)

Optional machine-readable delta (if requested):

- `{timestamp}--aix-delta--MP.json` containing baseline snapshot id, current snapshot id, and per-dimension deltas

Default retention policy (guidance):

- Keep the **most recent 10** runs per mounted project.
- Keep runs for up to **90 days**, whichever is fewer.
- Do not delete anything automatically in v1 unless the user explicitly requests cleanup (report-only can recommend cleanup).

### Validation plan (v1)

Validation is best-effort and must not assume a specific tech stack.

- **Baseline checks (always available):**
  - denylist enforcement (no proposed/apply changes outside allowlist)
  - report generation completes and artifacts are written to the configured audits directory

- **Project-type checks (only if discoverable / declared):**
  - If `package.json` exists: prefer `npm run -s format:check` and `npm test` if present.
  - If common build scripts exist: run a lightweight build smoke check (e.g., `npm run -s build`, or project-specific equivalent).

Manifest-driven overrides (recommended for DX):

- The mounted project may declare optional validation commands in `aix.manifest.yaml` (see `validation.commands`) so Concierge can run consistent checks without guessing.
- If not declared, Concierge should list suggested commands and ask the user to confirm before running.

### Logging & measurement hooks (v1)

For each mounted-project run, Concierge should emit a concise structured summary to the scaffold logs (in addition to writing artifacts to the mounted project):

- mounted project identifier (path + optional repo)
- probe subset
- discovery confidence
- baseline snapshot filename (or “none”)
- current snapshot filename
- overall score and per-dimension scores
- overall delta vs baseline
- whether any auto-fix was applied (and which categories)

## Implementation notes (v1)

This section specifies concrete mechanics for file IO and comparison so the feature is implementable and consistent.

### Manifest discovery (deterministic)

1) Check `/project-root/aix.manifest.yaml`
2) If missing, check `/project-root/docs/ai/aix.manifest.yaml`
3) If both exist, root wins

If manifest parsing fails:

- treat as `discoveryConfidence: low`
- do not apply overrides
- include parse error details in the report (without stack traces unless requested)

### Resolve audit output directory

Resolved `auditOutputDir` is computed as:

1) explicit request override (if provided)
2) manifest `overrides.outputs.auditsDir` (if provided)
3) default `docs/ai/audits`

If the directory does not exist:

- report-only: may create it to write audit artifacts (directory creation only)
- auto-fix (explicit opt-in): may create it if within allowlist (`docs/ai/**`)

### Artifact writing

Artifacts are written under the resolved audit directory using timestamped filenames.

- Report: `{timestamp}--aix-audit--{probeSubset}.md`
- Snapshot: `{timestamp}--aix-snapshot--{probeSubset}.json`
- Optional delta: `{timestamp}--aix-delta--{probeSubset}.json`

### Snapshot baseline selection

For a given `probeSubset`:

- **Baseline** = earliest snapshot file in the audit directory matching `*--aix-snapshot--{probeSubset}.json`
- **Previous** = snapshot immediately preceding the current snapshot by timestamp order

Comparison defaults:

- baseline vs current
- optionally allow previous vs current

### inputsHash (comparability)

Compute `inputsHash` as SHA-256 of a canonical JSON payload that includes:

- `probeSubsetId` (e.g., `MP`)
- `probeDefinitions` (the exact prompt texts or stable IDs + version for MP1–MP5)
- `scorecardVersion` (reference to `/specs/performance/aix.md` revision identifier if available)
- any fixed run parameters (probe count, verbosity)

If the implementation cannot access a git revision identifier, store a placeholder and include the probe definitions verbatim to preserve comparability.

### Delta computation

Given `baselineSnapshot` and `currentSnapshot`:

- per-dimension delta: `current - baseline`
- overall delta: `current.overall - baseline.overall`
- band change: recompute band based on the rubric for both snapshots

### Safe command execution (validation)

All command execution is confirmation-gated.

Command sources, in order:

1) Explicit user-provided command list in the request
2) Manifest `validation.commands`
3) Heuristic suggestions (do not auto-run)

If commands are executed:

- run from mounted project root
- record command, exit code, and a short stdout/stderr excerpt in the audit report
- never treat failed optional commands as a hard failure; instead note the failure and continue

### Auto-fix application flow (file safety)

Before apply:

- ensure all proposed file operations remain within allowlist
- re-check denylist
- ensure a diff preview is available

Apply:

- apply selected changes
- write a post-change snapshot and delta summary

If any denylist violation is detected at any point:

- stop immediately and return report-only output

## Decisions

- Mounted project benchmark prompts originate from the scaffold; the mounted project is the system under test.
- Reuse the scaffold AIX scorecard and probe bank for comparability.
- Default to report-first with optional, reversible auto-fix within a strict allowlist.
- Mounted projects may provide optional metadata via a manifest to improve discovery and override select defaults (e.g., audit output destination).

## Open Questions

- Should we later formalize a manifest schema/version field and publish a JSON Schema for editor validation?

- Should we later add expected outputs / pass criteria per `validation.commands` entry (e.g., regex matchers) to support automated pass/fail?
