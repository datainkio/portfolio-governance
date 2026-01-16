# Performance Spec Template

- **Title:** {{page/feature/system}}
- **Owner(s):** {{team/people}}
- **Status:** draft
- **Last reviewed:** {{date}}
- **Scope:** {{routes/components/workloads}}
- **Links:** context {{/context/...}}, ADRs {{/docs/decisions/...}}, runbooks {{/docs/runbooks/...}}, related specs {{/specs/routes-content or /specs/components}}

## Budgets & Targets
- Metrics (LCP, CLS, TTFB, FID/INP, bundle sizes), thresholds, devices/network conditions.

## Measurement Plan
- Tools, environments, sampling windows, dashboards.

## Hot Paths & Risks
- Critical user paths, heavy components, third-party dependencies.

## Optimization Plan
- Tactics (code splitting, caching, image strategy), ownership, sequencing.

## Regression Guardrails
- Tests, alerts, SLOs, acceptance gates for releases.

## Decisions
- Performance-related choices with rationale.

## Open Questions
- Unknowns, tradeoffs to validate.
