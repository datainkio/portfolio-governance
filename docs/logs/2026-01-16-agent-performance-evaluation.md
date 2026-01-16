# Agent Performance Evaluation (AIX) — 2026-01-16

Scope: VITAIXMEN only (Concierge + module routing + scaffold docs/runbooks/scripts). **Explicitly excludes** the mounted project at `frontend/`.

Evidence sources:
- AIX snapshot: [2026-01-16-aix-snapshot.md](2026-01-16-aix-snapshot.md)
- Hygiene maintenance: [2026-01-16-hygiene.md](2026-01-16-hygiene.md)
- Prior benchmark snapshot: [2026-01-15-agent-performance-evaluation.md](2026-01-15-agent-performance-evaluation.md)
- AIX targets/rubric: [../../specs/performance/aix.md](../../specs/performance/aix.md)
- Probe bank definition: [../maintenance/aix-probe-bank.md](../maintenance/aix-probe-bank.md)
- Concierge contract: [../../.github/agents/Concierge.md](../../.github/agents/Concierge.md)

Fresh check run (today):
- `node scripts/current-goals-check.mjs --fail-on-update --maxAgeDays 14` → “Current goals look fresh enough.” (via VS Code task)

Limitations:
- This is a *scaffold evaluation*, not a model evaluation.
- The 2026-01-16 snapshot is explicitly a “desk check” (no captured fresh-thread transcript). Treat metrics as directional.

---

## A. AIX metrics (directional)

From [2026-01-16-aix-snapshot.md](2026-01-16-aix-snapshot.md):
- FRA: 100% (3/3 desk-check probes)
- CR: 0% (0 blocking clarifications)
- HF: 0% (0 invented files/commands)
- TTUO: within targets (simple ≤2 turns)
- CUS: 2 (uses canonical, linkable pointers)

Notes:
- The strongest evidence remains the 2026-01-15 probe run table (4/4) which uses the explicit probe bank and captures concrete repo outcomes.

---

## B. Evaluation (1–5)

Rubric: [../maintenance/aix-evaluation.prompt.md](../maintenance/aix-evaluation.prompt.md)

### 1) Context Awareness — 5
Evidence:
- AIX scoring is grounded in the canonical spec and probe bank: [../../specs/performance/aix.md](../../specs/performance/aix.md), [../maintenance/aix-probe-bank.md](../maintenance/aix-probe-bank.md)
- Multi-root confusion is addressed directly with navigation pointers and prompt menus: [2026-01-16-hygiene.md](2026-01-16-hygiene.md), [../concierge-prompt-catalog.md](../concierge-prompt-catalog.md)

### 2) Task Routing & Scope Control — 5
Evidence:
- Only one registered entrypoint agent, reducing wrong-agent selection risk: [../../copilot-agents.json](../../copilot-agents.json)
- Explicit routing contract (primary module + optional secondary; max 2): [../../.github/agents/Concierge.md](../../.github/agents/Concierge.md), [../../.copilot/prompts/concierge.prompt.md](../../.copilot/prompts/concierge.prompt.md)

### 3) Output Quality — 4
Evidence:
- Recent maintenance produced concrete, minimal-churn fixes with clear logs: [2026-01-16-hygiene.md](2026-01-16-hygiene.md)
- Prompt catalog provides high-signal “ask shapes” to reduce TTUO and CR: [../concierge-prompt-catalog.md](../concierge-prompt-catalog.md)

Why not 5:
- The 2026-01-16 snapshot lacks captured “first response” excerpts, so output quality can’t be independently validated against the probe bank in the strictest sense.

### 4) Consistency & Predictability — 4
Evidence:
- Consistent, documented response schema and module triggers exist: [../../.copilot/prompts/_module-index.md](../../.copilot/prompts/_module-index.md), [../../.github/agents/Concierge.md](../../.github/agents/Concierge.md)

Why not 5:
- “Desk check” snapshots are less repeatable than a fresh-thread probe run; consistency should be revalidated periodically with recorded prompts.

### 5) Workspace Hygiene & DX Support — 5
Evidence:
- Fixes removed a concrete DX footgun: quoting `${workspaceFolder}` for paths containing spaces: [2026-01-16-hygiene.md](2026-01-16-hygiene.md)
- Explorer noise reduction and stronger navigation pointers lower misclick / mis-scope risk: [2026-01-16-hygiene.md](2026-01-16-hygiene.md)

---

## C. Failure modes (current)

Severity: Medium

- **Benchmark fragility:** AIX “desk checks” overestimate performance vs fresh-thread probes; without captured first responses, FRA/HF are easier to accidentally inflate.
- **Link drift risk:** The scaffold is intentionally link-heavy (maps → indexes → logs). This improves TTUO but increases the cost of stale links without automation.
- **Multi-root scope leakage:** Even with better tasks quoting and excludes, humans can still ask for “workspace” work that accidentally spills into mounted projects unless prompts explicitly constrain scope.

---

## D. Overall assessment

- Overall effectiveness: **4.6 / 5** (scaffold-level)
- Confidence level: **High** for routing + navigation + hygiene; **Medium-High** for metric claims unless backed by fresh-thread probe captures.

Primary strengths:
- Single-entrypoint design reduces wrong-agent selection.
- Strong routing contract + module index supports predictable behavior.
- Recent DX fixes directly reduce TTUO (tasks work even with spaces).

Primary weaknesses:
- Inconsistent evidence capture between “probe run” vs “desk check” snapshots.
- No automated link-check guardrail yet (HF driver over time).

---

## E. Recommendations (implementable)

1) **Make snapshots benchmark-grade**
- For the next AIX log, paste the probe prompt + first response excerpts (even 2–3 probes) to defensibly score FRA/HF.

2) **Add lightweight broken-link checking**
- Add a script or runbook step that checks Markdown link targets under `docs/` (existence only) to reduce drift-driven HF.

3) **Codify multi-root safety in the probe bank**
- Add one probe explicitly requiring “do not touch mounted projects” and score scope discipline.
