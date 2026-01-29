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

## Airtable Dependency Inventory (draft)
- Build-time Airtable collections wired via `frontend/eleventy/collections/content.js` and `njk/_data/site.json` (`site.airtables`).
- Navigation builds `nav_projects` from Airtable projects (see `frontend/eleventy/collections/navigation.js` and `frontend/eleventy/services/NavigationBuilder.js`).
- Templates still reference Airtable-backed collections such as:
  - `collections.projects`, `collections.organizations`, `collections.roles`, `collections.awards`
  - `collections.images`, `collections.videos`, `collections.galleries`, `collections.nuggets`, `collections.insights`
  - `collections.ia`, `collections.outcomes`, `collections.activities`
- Airtable tooling remains: `frontend/airtable/**`, `frontend/scripts/syncContent.js`, `frontend/scripts/generateAirtableSchema.js`.
- Docs and env vars still mention Airtable (`frontend/.env.example`, `frontend/docs/*`, `frontend/.github/copilot-instructions.md`).

## Airtable → Sanity Mapping (draft)

| Airtable collection | Sanity collection/type | Status | Notes |
| --- | --- | --- | --- |
| Activities | `sanityActivities` | mapped | Taxonomy exists in Sanity. |
| Organizations | `sanityOrganizations` | mapped | Includes industry + brand assets. |
| Awards | `sanityAwards` | mapped | Includes organization/project refs. |
| Projects | `sanityProjects` | mapped | Published-only; check slug/permalink policy. |
| Outcomes | `sanityOutcomes` | mapped | Taxonomy exists in Sanity. |
| Roles | `sanityRoles` | mapped | Taxonomy exists in Sanity. |
| Images | `sanityImageAssets` | mapped | Asset model exists in Sanity. |
| Feed | TBD | unmapped | Decide if this becomes posts or a dedicated type. |
| Insights | TBD | unmapped | Confirm if this maps to posts or a new type. |
| IA | TBD | unmapped | Define whether IA is a taxonomy or page model in Sanity. |
| Galleries | TBD | unmapped | Decide between gallery type vs embedded assets on content types. |
| Nuggets | TBD | unmapped | Define nugget content type or retire. |
| Playbook | TBD | unmapped | Define playbook model or retire. |
| Social | TBD | unmapped | Determine source (Sanity or static). |
| Videos | TBD | unmapped | Define video asset model or embed on content types. |

<!-- TODO(cms): Finalize the Airtable → Sanity mapping table with exact field parity and update affected templates. -->

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
