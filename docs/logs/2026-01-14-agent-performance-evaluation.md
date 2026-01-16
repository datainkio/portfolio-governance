# Agent Performance Evaluation – 2026-01-14

Scope: Concierge + module system in this workspace.
Evidence source: files present in-repo (prompts, docs, logs). No external probe session results captured yet.

---

## 1. Context Awareness

**Score (1–5): 4**

**Evidence**
- Routing contract enforces “infer constraints, proceed if not blocked” and limits clarifying questions to 1, reducing unnecessary CR/TTUO: [.copilot/prompts/concierge.prompt.md](../../.copilot/prompts/concierge.prompt.md)
- Non-hallucination guidance and explicit canonical inputs for analysis tasks: [.copilot/prompts/analyst.prompt.md](../../.copilot/prompts/analyst.prompt.md)
- Hygiene report demonstrates concrete context use and drift checking via file links (CUS-positive behavior): [docs/logs/2026-01-13-hygiene.md](2026-01-13-hygiene.md)

---

## 2. Task Routing & Scope Control

**Score (1–5): 4**

**Evidence**
- Exactly-one-primary-module rule with deliverable-driven tie-break and max-2-module limit: [.copilot/prompts/concierge.prompt.md](../../.copilot/prompts/concierge.prompt.md)
- Concierge entrypoint defines routing rubric and explicitly forbids agent-switch suggestions: [.github/agents/Concierge.md](../../.github/agents/Concierge.md)
- Module index provides stable triggers and primary output types (predictability): [.copilot/prompts/_module-index.md](../../.copilot/prompts/_module-index.md)

---

## 3. Output Quality

**Score (1–5): 4**

**Evidence**
- AIX metrics are defined with formulas, targets, and guardrails that support consistent evaluation: [specs/performance/aix.md](../../specs/performance/aix.md)
- Logging guidance requires concise, evidence-backed reports with metrics snapshots: [docs/logs/README.md](README.md)

---

## 4. Consistency & Predictability

**Score (1–5): 4**

**Evidence**
- Mandatory response schema (Classification / Deliverable / Assumptions / Next actions) reduces variance across tasks: [.copilot/prompts/concierge.prompt.md](../../.copilot/prompts/concierge.prompt.md)
- Standardized module definitions (purpose/triggers/output type) reduces routing ambiguity over time: [.copilot/prompts/_module-index.md](../../.copilot/prompts/_module-index.md)

---

## 5. Workspace Hygiene & DX Support

**Score (1–5): 4**

**Evidence**
- Hygiene report checks cross-file alignment and documents drift risks with links (DX-focused maintenance): [docs/logs/2026-01-13-hygiene.md](2026-01-13-hygiene.md)
- Documentation authority boundaries are explicit: [docs/README.md](../README.md), [context/README.md](../../context/README.md)

---

## 6. Failure Modes

**Severity: Medium**

**Notes**
- Key AIX metrics are not yet measured in logs. The AIX snapshot explicitly notes “no probe tasks executed yet,” preventing evidence-backed claims of improvement: [docs/logs/2026-01-13-hygiene-aix.md](2026-01-13-hygiene-aix.md)
- If canonical context stubs remain sparse, CR and TTUO may rise under real workflows due to ambiguous constraints or missing anchors.
- Boundary cases can still misroute (notably librarian vs navigator) unless validated through repeated probes.

Mitigation now exists (but is not yet executed/scored): the probe bank and checklist under docs/maintenance.

---

## 7. Overall Assessment

**Overall Effectiveness Score (1–5): 4**

**Primary Strengths**
- Strong routing contract with stable output schema.
- Explicit guardrails against hallucination and agent-switching.
- Solid hygiene/logging conventions that support long-term maintainability.

**Primary Weaknesses**
- Lack of recorded probe runs limits confidence in real-world FRA/HF/TTUO.
- Some key context areas appear intended-but-not-yet-fleshed, increasing risk of clarification churn.

**Confidence Level**
- Medium-high for hygiene/navigation/docs workflows.
- Medium for build/test/implementation workflows until a probe set is run and scored.

---

## 8. Recommendations

- Run and score the probe bank (10–15 prompts) and log results under docs/logs (directly addresses the “unmeasured” gap): [docs/maintenance/aix-probe-bank.md](../maintenance/aix-probe-bank.md), [specs/performance/aix.md](../../specs/performance/aix.md)
- Use the validation checklist as the standard scoring workflow; consider extending it into a one-page scoring worksheet: [docs/maintenance/aix-validation.md](../maintenance/aix-validation.md)
- Populate canonical context stubs that hygiene already flagged to reduce CR and improve routing anchors: [docs/logs/2026-01-13-hygiene.md](2026-01-13-hygiene.md), [context/README.md](../../context/README.md)
