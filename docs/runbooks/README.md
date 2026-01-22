# Runbooks

Operational how-tos live here. Each runbook should be actionable, time-bounded, and include checks, rollback, and comms. Link to `/context/` and `/specs/` for grounding.

## When to add
- Repeated ops: deploys, cutovers, CMS schema migrations, cache purges.
- Incident patterns: build failures, webhook errors, slow pages.
- Maintenance: rotating keys, upgrading dependencies, regenerating assets.

## Recommended runbook skeleton
- Title, Owner(s), Last validated date, Preconditions
- Steps (ordered), Expected outputs/checks, Rollback/undo, Comms template
- Links to dashboards/logs, related ADRs/specs, known pitfalls

## AIX/DX guidance
- DX: follow steps as written; update Last validated date when you verify.
- AIX: execute steps in order, confirm preconditions, and prefer rollback over improvisation if outcomes deviate.
- If data or links are missing, annotate the runbook and raise it in `/docs/notes/` to keep history.

## Examples
- [Refresh AI Context & Indexes](refresh-ai-context.md)
- [Context Freshness & Guided Refresh](context-freshness.md)
- [Update current goals](current-goals.md)

## Templates

- [AIX audit report template](../audit_report_template.md)
