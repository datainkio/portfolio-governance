# Performance Spec: Agent Experience (AIX)

- **Title:** Agent Experience (AIX)
- **Owner(s):** TBD
- **Status:** draft
- **Last reviewed:** 2026-01-13
- **Scope:** Workspace-wide agent workflows and authoring tasks
- **Links:** context /context/project.md, ADRs /docs/decisions, runbooks /docs/runbooks, related specs /specs/performance

## Budgets & Targets
- First-Response Accuracy (FRA): maintain >75% (good), warning 50–75%, broken <50%; formula $FRA = \frac{\text{correct first responses}}{\text{total attempts}}$.
- Clarification Rate (CR): keep <20% (good), warning 20–40%, broken >40%; $CR = \frac{\text{clarification prompts}}{\text{total interactions}}$.
- Hallucination Frequency (HF): keep <5% (good), warning 5–15%, broken >15%; $HF = \frac{\text{hallucinations}}{\text{total interactions}}$.
- Context Utilization Score (CUS): target frequent, precise use of project context; per-response scoring 0–2.
- Time-to-Useful-Output (TTUO): simple tasks ≤2 turns, complex ≤4 turns.
- AIX litmus: agent can (1) explain project structure and priorities, and (2) implement a small feature respecting constraints without invention or churn.

## Measurement Plan
- Sampling: evaluate representative tasks per milestone (simple + complex); include initial run only to capture FRA.
- Task set: reuse consistent prompts covering structure explanation, small feature implementation, and constraint adherence.
- Evidence: store scored runs (metrics, task text, agent response) in /data or adjacent runbook notes; keep first-response only for FRA.
- Scoring guidance: classify responses as correct / partially correct / incorrect; count clarification prompts explicitly; mark hallucinations when non-existent files/APIs/constraints are cited.
- Environments: run in the active workspace with current context files; rerun after significant context or tooling changes.
- Dashboards: lightweight table or sheet tracking FRA, CR, HF, CUS, TTUO over time; highlight regressions against scorecard bands.

## Hot Paths & Risks
- High-context tasks (spec authoring, performance docs) where stale or missing context can inflate CR and HF.
- Tooling misuse (referencing non-existent files, APIs) driving HF.
- Ambiguous scopes or conflicting specs raising CR and TTUO.
- Workspace churn (renames, undone edits) causing stale links and misaligned guidance.

## Optimization Plan
- Harden context: keep /context and /specs current; flag deprecated docs to reduce ambiguity.
- Prompt hygiene: maintain a canonical task bank and include necessary constraints inline to reduce clarifications.
- Guard hallucinations: prefer verified file paths and tools; add quick pre-flight checks for file existence before citing.
- Speed: batch required context reads; minimize unnecessary follow-ups to stay within TTUO targets.

## Regression Guardrails
- Pre-release check: rerun task set; block if FRA <75%, HF >5%, or TTUO exceeds targets.
- Monitoring: track metric trends per milestone; open follow-up items when dropping into warning bands.
- Tests: add scripted checks for broken links or missing referenced files to reduce HF drivers.

## Decisions
- Scorecard bands adopted from AIX guidance (good/warning/broken) to standardize pass criteria.

## Open Questions
- Who owns ongoing scoring and dashboard maintenance?
- Where should canonical task bank and scored runs live (e.g., /data subfolder)?
- Do we automate scoring or keep manual for now?
