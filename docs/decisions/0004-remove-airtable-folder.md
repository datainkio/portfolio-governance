# ADR 0004 — Remove Airtable Integration Folder

- **Status:** accepted
- **Date:** 2026-01-30

## Context

The frontend has been transitioning to CMS-backed data and has accumulated technical debt from legacy Airtable integrations. Keeping the Airtable integration folder in place creates ambiguity, encourages unintended coupling, and increases maintenance burden.

## Decision

Remove the Airtable integration folder from the frontend repo (`frontend/airtable`). Future content access should be routed through the CMS integration layer.

## Rationale

- **Decoupling:** keeps frontend data access source-agnostic and reduces implicit dependencies.
- **Clarity:** removes dead paths and makes the current content system explicit.
- **Maintenance:** reduces code surface area and maintenance overhead.

## Consequences

- Any remaining references to Airtable utilities must be removed or replaced.
- Documentation that mentions Airtable should be updated or deprecated.
- Builds that relied on Airtable integrations must use CMS collections instead.

## Links

- CMS integration: `frontend/cms/README.md`
- Sanity integration notes: `frontend/docs/sanity-integration.md`
