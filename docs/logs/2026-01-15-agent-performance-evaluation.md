# Agent Performance Evaluation (AIX) – 2026-01-15

Scope: Vitaixmen (Concierge + module routing + repo hygiene conventions).

Evidence sources:
- In-repo specs/prompts/docs
- This session’s completed hygiene work and resulting file changes

Limitations:
- The probe bank recommends a fresh Copilot Chat thread; this run was performed in-thread and is best treated as a “snapshot” rather than a benchmark-grade evaluation.

---

## A. Probe Run (subset)

Probe definitions: [docs/maintenance/aix-probe-bank.md](../maintenance/aix-probe-bank.md)

| ID | Expected module | FRA | Clarifications | Hallucinations | TTUO | CUS | Notes |
|---:|---|:---:|---:|---:|---:|---:|---|
| P1* | housekeeper | Y | 0 | 0 | 1 | 2 | *Mapped to user prompt “Check the hygiene of vitaixmen”. Implemented concrete fixes + log.* |
| P2† | librarian | Y | 0 | 0 | 1 | 2 | †Synthetic prompt: onboarding docs location. Correctly points to `docs/onboarding/README.md` + links from `docs/README.md` + root README. |
| P4† | architect | Y | 0 | 0 | 1 | 2 | †Synthetic prompt: minimal-churn reorg. Recommendation: keep Concierge + module model, improve indexes/maps, avoid moving files. |
| P9† | mechanic | Y | 0 | 0 | 1 | 2 | †Synthetic prompt: failing test module selection. Correct answer: `mechanic`. |

### Probe evidence (concrete outcomes)
- Hygiene/structure fixes delivered:
  - `.gitattributes` added: [../../.gitattributes](../../.gitattributes)
  - `context/current-goals.md` added: [../../context/current-goals.md](../../context/current-goals.md)
  - Workspace map drift fixed: [../../.copilot/context/workspace-map.md](../../.copilot/context/workspace-map.md)
  - Canonical context typos fixed: [../../context/README.md](../../context/README.md)
  - Hygiene log written: [2026-01-15-hygiene.md](2026-01-15-hygiene.md)

---

## B. Metric Summary (this snapshot)

Definitions: [specs/performance/aix.md](../../specs/performance/aix.md)

- FRA: 4/4 = 100%
- CR: 0/4 = 0%
- HF: 0/4 = 0%
- TTUO: 1 turn (median across probes)
- CUS: 2.0 average (explicit use of `context/`, `specs/`, and correct repo filepaths)

---

## C. Evaluation (1–5)

Reference rubric: [docs/maintenance/aix-evaluation.prompt.md](../maintenance/aix-evaluation.prompt.md)

### 1) Context Awareness — 5
Evidence:
- Correct canonical vs curated boundaries and curated drift correction: [../../context/README.md](../../context/README.md), [../../.copilot/context/workspace-map.md](../../.copilot/context/workspace-map.md)
- Consulted AIX spec and probe bank before scoring: [../../specs/performance/aix.md](../../specs/performance/aix.md), [../maintenance/aix-probe-bank.md](../maintenance/aix-probe-bank.md)

### 2) Task Routing & Scope Control — 4
Evidence:
- Routing contract exists and is clear: [../../.github/agents/Concierge.md](../../.github/agents/Concierge.md)
Notes:
- This in-thread evaluation doesn’t fully validate real routing behavior across diverse prompts; a fresh-thread probe run would.

### 3) Output Quality — 4
Evidence:
- Delivered tangible repo improvements and documented them in a dated log: [2026-01-15-hygiene.md](2026-01-15-hygiene.md)
Notes:
- Stronger with strict fresh-thread probe capture including raw first responses.

### 4) Consistency & Predictability — 4
Evidence:
- Standard response schema and module index exist: [../agents.md](../agents.md), [../../.copilot/prompts/_module-index.md](../../.copilot/prompts/_module-index.md)

### 5) Workspace Hygiene & DX Support — 5
Evidence:
- Fixes were minimal, scaffold-aligned, and reduced drift/footguns:
  - Added missing scaffold-managed `.gitattributes`
  - Added `context/current-goals.md` stub that the workspace map expected

---

## D. Failure Modes

Severity: Medium

- Probe quality risk: “in-thread” scoring can overestimate FRA/HF vs a fresh-thread run.
- If `context/current-goals.md` remains empty, CR and TTUO may drift upward on real feature work due to ambiguous priorities.

---

## E. Recommendations

- Run a benchmark-grade probe session in a fresh Copilot thread and paste the raw first responses into a log (or attach as artifacts) to lock in defensible FRA/TTUO.
- Keep `context/current-goals.md` updated (3–7 bullets) to reduce clarification churn.
- Consider adding a lightweight, scripted link checker for `docs/` to reduce HF drivers from stale links.
