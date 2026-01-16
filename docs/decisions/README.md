# Decisions

Authoritative decision records (ADRs) live here. They capture why we chose an approach, alternatives considered, and the impact on teams and systems. Keep them concise and link back to `/context/` and `/specs/` when relevant.

## How to use
- Add a new ADR per significant choice (architecture, tooling, data contracts, security posture).
- Prefer one file per decision; name with sequence and slug, e.g., `0001-use-sanity.md`.
- Update `/context/` summaries after a decision is accepted to avoid drift.

## Recommended ADR skeleton
- Title, Status (`proposed`, `accepted`, `superseded`, `rejected`), Date, Owners
- Context (problem, constraints), Options considered
- Decision (what and why), Consequences (positive/negative)
- Links to related specs, runbooks, tickets

## AIX/DX guidance
- DX: skim status and consequences first; they state what changed and why.
- AIX: treat accepted ADRs as authoritative; avoid suggestions that conflict unless explicitly marked as `proposed` or `superseded`.
- When uncertainty exists, prefer the latest accepted ADR; if missing, flag in `/docs/notes/` or `/context/`.

## Examples
- [ADR 0001: Vitaixmen for AI Performance](0001-vitaixmen-for-ai.md)
