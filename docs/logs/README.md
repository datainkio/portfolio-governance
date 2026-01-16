# Logs

Use this folder to store Concierge/agent operational artifacts for the scaffold itself and for mounted projects.

## Project Logs

Project-specific audits and evaluations live under:

- `docs/logs/projects/<project-slug>/`

Index:

- [docs/logs/projects/](projects/README.md)

Example:

- [docs/logs/projects/frontend/](projects/frontend/README.md)

## Hygiene Reports

Use this folder to store scaffold hygiene reports produced by agents (housekeeper/analyst). Reports should be concise, link to files touched, and include evidence for AIX metrics. Log an AIX snapshot here after each context refresh per `specs/performance/aix.md`.

### Naming

- `YYYY-MM-DD-hygiene.md`

## Required Sections
- Summary (one paragraph)
- Actions Taken (bulleted, with links)
- Findings (issues, risks; include links)
- Recommendations / Follow-ups
- Metrics Snapshot (FRA, CR, HF, CUS if applicable)

## Example Skeleton

```markdown
# Hygiene Report – 2026-01-13

## Summary
- Refreshed excludes; scanned context/specs; no blockers.

## Actions Taken
- Validated folder set `/context`, `/specs`, `/docs/decisions`, `/docs/runbooks`, `/docs/notes`.
- Checked `.vscode/settings.json` and `.gitignore` align on excludes.

## Findings
- Missing `constraints.md` content; add defaults.

## Recommendations
- Update `/context/constraints.md` with hygiene guardrails.

## Metrics
- FRA: n/a (maintenance)
- CR: 0
- HF: 0
- CUS: 2 (relied on context/runbooks)
```
