# Copilot Prompt Module: Portfolio Frontend Domain (11ty + Nunjucks + Tailwind v4 + GSAP + Airtable + Sanity)
> Implement changes in the `frontend/` repo using the project’s conventions and guardrails.

## Purpose
Deliver correct, minimal changes for the Portfolio Frontend codebase by enforcing domain-specific constraints (11ty/Nunjucks structure, Tailwind v4 workflow, GSAP choreography architecture, and build-time content patterns) while preserving the platform scaffold’s AIX norms.

## Triggers (use when…)
Use this module when the request clearly targets the **portfolio frontend repo** and involves one or more of:
- editing files under `frontend/` (templates, JS, styles, 11ty config)
- Eleventy (11ty), Nunjucks templates/macros/components
- Tailwind v4 build workflow, design token usage, CSS layering
- GSAP choreography (Director/sections/triggers/animations, AnimationBus)
- Airtable build-time collections, `frontend/eleventy/` services/filters/shortcodes
- Sanity integration in the portfolio frontend context

## Non-triggers (do not use when…)
- The request is primarily about the platform scaffold (`aix/`) structure, routing policy, or prompt modules.
- The request is ambiguous about which repo is being changed.
- The task is purely documentation editing (use Librarian/Editor).
- The task is general analysis, tradeoffs, or architecture decision-making (use Analyst/Architect).

## Primary Output (Type: Markdown)
A single **Implementation Report** in Markdown with exactly these sections:
- **Summary** (what was implemented)
- **Changes** (bulleted list of files touched + what changed)
- **How to Verify** (commands or steps)
- **Notes** (tradeoffs, edge cases, limitations)
- **Next Actions** (optional follow-ups)

## Blocking question (max 1, only if required)
Which frontend area is this change in?
- `njk/` templates/components
- `styles/` / Tailwind build
- `js/choreography/` (GSAP)
- `eleventy/` (collections/filters/shortcodes)

If the repo target is unclear, ask: “Should this be implemented in `frontend/`?”

## Hard Guardrails (must comply)
- Verify file existence before citing paths (use workspace search / file reads).
- Do not edit generated output: `frontend/_site/`.
- Do not hand-edit Figma-generated token outputs (they are overwritten by `build:design`).
- Do not invoke Tailwind CLI directly; use the project’s npm scripts.
- Default to `npm run start:nobundle` for local dev (avoid `assets/js/choreography/bundle.js`) until explicitly told otherwise.
- Do not invent non-existent sections or controllers; confirm via repo search.

## Domain Conventions (do)
### Authority & Read Order (fast)
1) `aix/context/projects/portfolio-frontend.md` (multi-root boundary)
2) Relevant frontend file-scoped prompts (when editing frontend files):
   - `frontend/.copilot/*.prompt.md` and `frontend/.github/copilot-instructions.md`
3) The nearest related code in `frontend/`

### 11ty + Nunjucks
- Keep logic minimal in templates; prefer macros for reusable components.
- Follow existing atomic structure under `frontend/njk/_includes/`.

### Tailwind v4 + Design Tokens
- Respect `frontend/styles/main.css` import order and layer strategy.
- Prefer existing tokens/utilities; do not “recreate” tokens by hand.

### GSAP Choreography
- Keep within the existing architecture: Director → sections → triggers/animations.
- Coordinate cross-section behavior via `AnimationBus` events.
- Respect reduced-motion handling.

### Content (Airtable / Sanity)
- Treat content as build-time data; follow patterns in `frontend/eleventy/`.

## Validation
- Prefer narrow checks relevant to the change (e.g., `npm test` only if touching tested areas).
- If touching build integration, run the smallest build step that exercises it (e.g., CSS build or 11ty build) when feasible.

Default local verification command (until changed):
- `npm run start:nobundle`

## Example calls
- “In `frontend/`, add a Nunjucks molecule macro for a callout card and show how to import it on the About page.”
- “In `frontend/js/choreography/`, emit an `AnimationBus` event when the hero intro completes.”
- “In `frontend/eleventy/`, add a date-formatting filter and wire it into the Eleventy config.”
- “In `frontend/styles/`, add a small utility style the right way for Tailwind v4 (no direct Tailwind CLI).”
