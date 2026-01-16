# TODO — Concierge: Project AIX Maintenance Feature

## Foundation

- [x] Define feature focus: optimize/maintain AIX for imported projects (e.g., frontend) inside scaffold workspace
- [x] Decide v1 scope: report + optional auto-fix (explicitly invoked)
- [x] Write one-sentence problem statement + non-goals (captured in specs/features/concierge-mounted-project-aix.md)
- [x] Define success criteria (routing accuracy, fewer wrong-file edits, lower prompt drift, faster onboarding)

## Terminology

- [x] Define terminology for projects brought into scaffold workspace (use: “Mounted Project”; /frontend is the reference example)

## Permissions & Guardrails (Mounted Projects)

- [x] Define permission/safety scope inside mounted projects (audit vs auto-fix; file boundaries; confirmation rules)
- [x] Define Auto-fix Allowlist (paths Concierge may edit in a mounted project)
- [x] Define Auto-fix Denylist (paths Concierge must never edit)
- [x] Define allowed operations (create/move/merge/delete/edit) per allowlisted area
- [x] Define confirmation model (report-only default; auto-fix requires explicit opt-in)
- [x] Define dry-run/apply contract (always preview diff + summary before apply)
- [x] Define rollback contract (how to revert each auto-fix category; preserve legacy references)
- [x] Define “generated output” contract (never treat generated files as source-of-truth)
- [ ] Define doc-optimization policy for mounted projects (allowed: improve discoverability/cross-linking, consolidate prompts/modules, reduce duplication; forbidden: rewrite product docs for style)
- [ ] Define doc-optimization allowlist (which doc areas may be changed, e.g. docs/ai/, prompt indexes)
- [ ] Define doc-optimization denylist (product docs / marketing copy / narrative docs unless explicitly requested)
- [x] Define guardrails for ignored paths (don’t touch vendor/build/.obsidian/_site etc.)
- [x] Define safety rules for build artifacts (ensure bundles/dist output are ignored; do not add generated files)
- [x] Define dependency policy (auto-fix must not add new deps; can only adjust docs/prompts/ignores)

### Allowlist/Denylist (v1 draft checklist)

- [x] Allowlist: `.copilot/**` (prompt modules, context packs, indexes)
- [x] Allowlist: `docs/ai/**` (AIX docs, examples, entrypoints)
- [x] Allowlist: `.github/agents/**` (only for relocating/disabling conflicting selectable agents)
- [x] Allowlist: `.github/copilot-instructions.md` (only to clarify scope/authority; no broad rewrites)
- [x] Allowlist: `.gitignore` (only for AIX-relevant noise reduction: generated bundles, build outputs)
- [x] Denylist: build outputs (`_site/**`, `dist/**`, `.cache/**`, `node_modules/**`, vendor bundles)
- [x] Denylist: user-private/workspace folders (`.obsidian/**`, IDE state)
- [ ] Denylist: production source behavior files (templates/JS/CSS) unless explicitly requested

### Confirmation rules (v1 draft checklist)

- [x] Auto-fix must be invoked with an explicit “apply” intent
- [x] Auto-fix must show: planned changes + file list + diff preview + rollback notes
- [ ] Auto-fix must support: apply-all vs apply-selected changes
- [x] Auto-fix must stop if changes touch denylisted paths

## Benchmarking & Scoring

- [x] Define benchmark + scoring model (what gets measured, weighting, and what “good” looks like)
- [x] Reuse scaffold AIX metrics as the default scorecard (FRA/CR/HF/TTUO/CUS from specs/performance/aix.md)
- [x] Reuse the existing probe bank as the benchmark harness (docs/maintenance/aix-probe-bank.md)
- [ ] Extend probe bank with a mounted-project subset (project discovery + prompt routing + safe auto-fix dry-run)
- [x] Define mounted-project probe subset prompts (scaffold-owned prompts that exercise mounted-project AIX surfaces)
- [x] Define pass criteria per mounted-project probe (expected module, file targets, safety rules, and what counts as “useful output”)
- [x] Decide the default probe count for mounted projects (recommended: 5 prompts; expandable to 10)
- [x] Reuse the validation checklist format (docs/maintenance/aix-validation.md) for “before/after” runs
- [x] Specify baseline benchmark capture per project (timestamped snapshot of scores + key signals)
- [ ] Implement baseline benchmark capture per project (store snapshot artifacts)
- [x] Specify re-score + comparison output (baseline vs current; deltas; pass gates)
- [ ] Implement re-score + comparison (run probes; write snapshots; produce deltas)
- [x] Specify logging + measurement hooks (baseline vs post-change score deltas)
- [ ] Implement logging + measurement hooks (emit structured run summaries)

### Implementation (v1 mechanics)

- [x] Specify implementation mechanics (manifest discovery, artifact IO, baseline selection, delta computation, command gating)
- [ ] Implement: deterministic manifest discovery (root + fallback)
- [ ] Implement: audit directory resolution + safe creation (auto-fix only)
- [ ] Implement: snapshot writer + baseline/previous selector
- [ ] Implement: delta generator + report formatter
- [ ] Implement: confirmation-gated validation command runner

### Mounted-project probe subset (v1 draft checklist)

- [x] MP1 — Identify mounted project AIX entrypoints (expects: `navigator`)
- [x] MP2 — Explain authority chain (scaffold vs mounted project) (expects: `analyst` or `architect`)
- [x] MP3 — Recommend 3 highest-leverage AIX improvements inside mounted project (expects: `analyst`)
- [x] MP4 — Propose optional auto-fix plan with dry-run diff + rollback notes (expects: `implementer` or `housekeeper`)
- [x] MP5 — Denylist enforcement test (“try to edit _site/ or node_modules”) and confirm refusal (expects: correct refusal + safe alternative)

## Discovery (Mounted Project Profiling)

- [ ] Inventory current AIX surfaces in imported projects (.copilot/, docs/ai/, .github/copilot-instructions.md, legacy agents)
- [ ] Design “Project AIX Profile” format (derived facts: prompts, context packs, entrypoints, ignored paths, build artifacts)
- [ ] Specify discovery algorithm (multi-root scan + heuristic scoring + duplicate/overlap detection)

## Recommendations & Output (Report Mode)

- [ ] Add UX for Concierge output (audit summary, recommended moves, one-command/one-patch options)
- [ ] Define “AIX hygiene checklist” generation (project-local, actionable, links to files)
- [ ] Define Concierge routing rules for imported projects (module selection precedence; conflict resolution)

## Optional Auto-fix

- [ ] Specify remediation actions (report-first suggestions + optional auto-fix; never touch generated/build outputs)
- [ ] Define auto-fix invocation UX (dry-run default; confirm/apply; patch preview)
- [ ] Define rollback strategy (revert prompt/module moves; preserve legacy references)

## Workflows

- [ ] Define optimization workflow (one-time improvements): identify highest-leverage fixes → propose patches → optional apply → validate with scoring deltas
- [ ] Define maintenance workflow (ongoing hygiene): detect drift/noise regressions → suggest pruning/realignment → optional apply → validate with scoring deltas

## Validation & Release

- [x] Create validation steps (format check, tests, build smoke checks) per project type
- [x] Draft the first pilot runbook: “Optimize AIX for frontend” (inputs, outputs, expected diffs)
	- [x] Capture edge cases (multiple projects, conflicting prompt authorities, missing prompts, monorepos)
	- [x] Add acceptance checklist for release (docs, safety checks, example audit output)

## Spec Drafting (start now)

- [x] Spec: One-paragraph overview (Mounted Project AIX: report + optional auto-fix)
- [x] Spec: Definitions (Mounted Project, AIX surfaces, benchmark run, auto-fix, denylist)
- [x] Spec: User stories (designer/dev mounting /frontend; maintaining AIX over time)
- [x] Spec: Non-goals (no product feature refactors; no generated output edits; no dependency adds)
- [x] Spec: System flow (discover → benchmark → recommend → optional dry-run → optional apply → re-score)
- [x] Spec: Data model (Mounted Project Profile; Benchmark Snapshot; Finding; Recommendation; Patch Plan)
- [x] Spec: UX output contract (Classification/Deliverable/Assumptions/Next actions; patch preview format)
- [x] Spec: Safety model (allowlist/denylist, confirmation/rollback, stop conditions)
- [x] Spec: Benchmarking plan (reuse probe bank + MP subset; scoring with FRA/CR/HF/TTUO/CUS)
- [ ] Spec: Auto-fix categories (docs optimization, prompt modularization, ignore hygiene, agent deconfliction)
- [ ] Spec: Validation plan (before/after comparison, regression guardrails, logs)
- [x] Spec: Open questions list (record gaps as they surface during drafting)

- [x] Create root-level optional manifest template (aix.manifest.yaml) to improve discovery + DX