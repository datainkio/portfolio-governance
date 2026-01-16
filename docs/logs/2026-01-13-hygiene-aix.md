# Hygiene & AIX Snapshot – 2026-01-13

## Summary
- Desk review only: captured current project understanding and logging alignment; no probe tasks executed yet.

## Actions Taken
- Reviewed agent layout (`.github/agents`) and manifest (`copilot-agents.json`) for Copilot discovery.
- Noted canonical context/specs locations: `/context`, `/specs`, `/docs`, `/.copilot/context`.
- Confirmed log destination: `docs/logs/` with README guidance.

## Findings
- Agents are centralized under `.github/agents` with prompts in `.copilot/prompts`; manifests point correctly.
- No AIX probe runs executed in this snapshot; metrics unmeasured.

## Recommendations / Follow-ups
- Run AIX probe set (simple + complex) to capture FRA/CR/HF/TTUO/CUS: e.g.,
  - Simple: describe current frontend build/output paths for 11ty.
  - Complex: outline steps to add a Sanity content type and surface schema entrypoints.
- Log the scored results in `docs/logs/` using the standard sections.

## Metrics Snapshot
- FRA: not measured (no probes run)
- CR: not measured
- HF: not measured
- TTUO: not measured
- CUS: not measured
