# Spec: Sanity Adoption (Replace Airtable as Source of Truth)

- **Title:** Sanity Adoption — Full Separation from Airtable
- **Owner(s):** Russell
- **Status:** draft
- **Last reviewed:** 2026-01-16
- **Scope:** Portfolio frontend content pipeline (11ty data sources, collections, templates, and build scripts)
- **Links:**
  - Frontend Sanity integration notes: `frontend/docs/sanity-integration.md`
  - Frontend project context: `aix/context/projects/portfolio-frontend.md`

## Goal
Make Sanity the single source of truth for site content.

Success means:
- No Airtable-backed content is required to build or run the site.
- All content previously supplied by Airtable is supplied by Sanity (or explicitly retired).
- Airtable sync scripts, env vars, and collections are removed or clearly deprecated.

## Non-goals
- Rewriting the visual design system or choreography architecture.
- Content modeling perfection on day 1 (we prefer an incremental migration with a stable minimum model).
- Building a runtime “headless” app—this remains build-time 11ty.

## Current State (as of 2026-01-16)
- The frontend repo already fetches Sanity content at build time (GROQ + official client) and exposes multiple `sanity*` collections.
- Airtable is still present and used for some content and/or legacy collections.

## Adoption Strategy (phased)
### Phase 0 — Inventory + mapping (no behavior change)
- Inventory Airtable usage:
  - Which 11ty collections come from Airtable?
  - Which templates/pages depend on those collections?
  - Which fields are required vs optional in the UI?
- Inventory existing Sanity collections/queries and identify gaps.
- Produce a mapping table: Airtable table/fields → Sanity document types/fields → UI consumers.

### Phase 1 — Sanity parity (Sanity can supply everything)
- Define/extend Sanity schema types to cover the required content.
- Implement/extend Sanity GROQ queries to return the exact data shape needed.
- Ensure images/media handling is covered (asset references, alt text requirements, focal points if needed).

### Phase 2 — Cutover (templates stop reading Airtable)
- Update 11ty collections and templates to read only Sanity-backed collections.
- Keep URLs stable (slug rules, permalinks, redirects if needed).
- Add missing-state handling where Sanity content may be incomplete during migration.

### Phase 3 — Airtable removal
- Remove Airtable fetch/sync steps from the build pipeline where no longer needed.
- Remove Airtable env vars from docs and `.env.example` (or clearly mark as deprecated if temporarily retained).
- Remove Airtable schema generation and related docs if unused.

## Content Models (initial targets)
Initial target content types to migrate (draft list; confirm):
- Organizations + industries + roles
- Projects + outcomes + awards
- Posts (if used)
- Global site copy used in sections (hero, bio, etc.)

## Delivery & Serialization
- Data is fetched during 11ty build via Sanity client + GROQ.
- Responses are cached using Eleventy Fetch (respect per-query cache settings).
- Collections are exposed as `collections.sanity*` in Nunjucks.

## Verification / Acceptance Criteria
Adoption is complete when:
- `npm run build` succeeds without Airtable credentials set.
- No code path attempts to fetch Airtable data during build.
- All pages that previously depended on Airtable still render with equivalent content from Sanity.
- Documentation reflects Sanity-only setup and removes Airtable onboarding steps.

## Risks
- Field-shape drift: templates depending on Airtable field names may require careful mapping.
- Slug/permalink mismatch could break URLs.
- Media pipeline differences (Airtable attachments vs Sanity image assets).

## Open Questions (for you)
1) Which Airtable tables are currently considered “must keep” vs “can retire”?
2) Do you want draft/preview support (requires `SANITY_API_TOKEN`) or strictly published content?
3) What is the canonical slug/permalink policy for projects and posts?
4) Should we migrate existing Airtable data into Sanity (one-time import), or re-author manually?

## Next Actions
- Confirm the target content types and what “parity” means (exact fields vs “good enough”).
- Create the Airtable→Sanity mapping table.
- Identify and update the first cutover page (recommend starting with a single section/page that has clean boundaries).
