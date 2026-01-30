
# Decisions

This file is a **short, canonical index** of the most relevant accepted decisions for this workspace.

Full decision records live as ADRs under `/docs/decisions/`.

## Recently accepted

- **ADR 0004 — Remove Airtable Integration Folder**
	- Removes the legacy Airtable integration folder from the frontend to reduce coupling and maintenance overhead.
	- Source: `/docs/decisions/0004-remove-airtable-folder.md`

- **ADR 0003 — Context Freshness Gate (Sidecar + Deterministic Drift Scoring)**
	- Keeps `/context` review metadata in a sidecar and enforces drift thresholds via repo-managed git hooks (including cross-repo frontend signals).
	- Source: `/docs/decisions/0003-context-freshness-gate.md`

## Decision precedence

1. Latest **accepted ADR** wins when decisions conflict.
2. `/specs` define contracts; treat them as prescriptive.
3. `/context/current-goals.md` is time-bound priority, not architecture authority.

If you find contradictions, flag them explicitly as drift risks and propose where to fix (ADR vs context vs spec).

## Accepted ADRs (current)

- **ADR 0001 — Vitaixmen for AI Performance**
	- Establishes canonical folder semantics (`/context`, `/specs`, `/docs/decisions`, `/docs/runbooks`, `/docs/notes`) and prioritizes low-noise indexing.
	- Source: `/docs/decisions/0001-vitaixmen-for-ai.md`

- **ADR 0002 — Portfolio Frontend Domain Module Uses Internal Routing (Model A)**
	- Concierge remains the only router; the `portfolio-frontend-domain` module contains an internal classification map but is not a peer router.
	- Source: `/docs/decisions/0002-portfolio-frontend-domain-model-a.md`

- **ADR 0004 — Remove Airtable Integration Folder**
	- Removes the legacy Airtable integration folder from the frontend to reduce coupling and maintenance overhead.
	- Source: `/docs/decisions/0004-remove-airtable-folder.md`

## How to add / update decisions

- Create a new ADR in `/docs/decisions/` using the conventions in `/docs/decisions/README.md`.
- Once accepted, update this file with a 1–2 bullet summary and links.
- If superseded, keep the old ADR but mark it `superseded` and point to the replacement.
