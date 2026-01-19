# Spec: Domain-Specialized AI Coding Agent (11ty + Nunjucks + JS + GSAP + Sanity)

- **Title:** Domain-Specialized AI Coding Agent — Portfolio Frontend Toolkit
- **Owner(s):** Russell
- **Status:** MVP complete (iterating)
- **Last reviewed:** 2026-01-16
- **Scope:** Multi-root workspace with `aix/` (platform scaffold) + `frontend/` (11ty site)
- **Primary objective:** Reduce iteration friction and errors when building/maintaining a portfolio frontend using 11ty/Nunjucks, Tailwind, GSAP choreography, and CMS-backed content.

Links:
- Decision: `docs/decisions/0002-portfolio-frontend-domain-model-a.md`
- MVP evidence: `docs/logs/2026-01-16-portfolio-frontend-domain-mvp-evidence.md`

## Problem Statement
General-purpose coding assistance tends to:
- miss project-local constraints (auto-generated CSS tokens, Tailwind v4 workflow, 11ty/Nunjucks conventions)
- hallucinate file locations or sections
- bypass established choreography architecture (Director/sections/triggers)

This spec defines a domain-specialized agent behavior that is *predictable*, *constraint-driven*, and *low-drift* across a multi-root workspace.

## Authority & Sources of Truth
In this workspace:
- Platform scaffold authority: `aix/` (routing policy, AIX evaluation, workspace hygiene)
- Frontend authority: `frontend/` (implementation conventions, build workflows, file-scoped prompts)

Precedence (highest → lowest):
1) File-scoped prompts and repo-specific instructions in `frontend/` (when editing frontend files)
2) `aix/context/projects/portfolio-frontend.md` (multi-root boundary + pitfalls)
3) `aix/context/*` + `aix/specs/*` (platform constraints + evaluation)

## Non-goals
- Replacing Concierge as the only registered Copilot agent in `aix/`.
- Broad refactors inside `frontend/` that aren’t required to satisfy the current request.
- Editing generated outputs (e.g., `frontend/_site/`) or generated design token files.

## Domain Capabilities (Must-Have)
### 11ty + Nunjucks
- Correctly locate pages/templates/components under `frontend/njk/`.
- Prefer Nunjucks macros for reusable components.
- Respect existing atomic design structure under `frontend/njk/_includes/`.

### Tailwind v4 + Design Tokens
- Use the project’s npm scripts for CSS builds; do not call Tailwind directly.
- Respect `frontend/styles/main.css` import order and layer strategy.
- Never hand-edit Figma-generated token files (they are overwritten).

### GSAP Choreography
- Follow the established architecture (Director → sections → triggers/animations).
- Prefer `AnimationBus` events for cross-section coordination.
- Respect reduced-motion handling.

### CMS-backed content (Sanity or Airtable)
- Treat content as build-time data for 11ty.
- Use `frontend/eleventy/` patterns for collections/filters/shortcodes.

## Guardrails (Hard Constraints)
The domain-specialized agent must:
- verify file existence before citing paths (avoid hallucinations)
- avoid editing `frontend/_site/` (generated)
- avoid editing Figma-generated CSS token outputs
- avoid invoking Tailwind CLI directly; use npm scripts
- default to `npm run start:nobundle` for local dev (avoid `assets/js/choreography/bundle.js`) until explicitly told otherwise
- avoid inventing non-existent sections (e.g., “Work” section if not implemented)

## Deliverables
### D1 — Domain Spec (this document)
Defines scope, constraints, deliverables, and acceptance criteria.

### D2 — Domain Prompt Module (to be created in MVP)
A dedicated prompt module that Concierge can route to for frontend-domain work.
- Location: `aix/.copilot/prompts/portfolio-frontend-domain.prompt.md`
- Add to: `aix/.copilot/prompts/_module-index.md`
- Concierge routing update: `aix/.copilot/prompts/concierge.prompt.md` (minimal new triggers)

Routing note:
- The domain module uses **Model A** (internal routing map inside a single module); Concierge remains the only router. See `docs/decisions/0002-portfolio-frontend-domain-model-a.md`.

Current state (MVP):
- The module contains a compact “signals table” for fast classification and a multi-area walkthrough example.

### D3 — Minimal Context Bundle (to be created in MVP)
A stable, low-churn “what to read first” bundle for frontend tasks.
- Location: `aix/context/projects/portfolio-frontend.md` (already exists; may be extended)
- Optional curated references: `frontend/docs/` links to choreography + build workflow

### D4 — Probe Task Bank (to be created in MVP)
A small set of canonical tasks used to evaluate AIX improvements.
- Location suggestion: `aix/specs/ai/domain-agent-probes.md`

## MVP Acceptance Criteria
An MVP is complete when:
- The prompt module exists and is indexed for routing.
- The module reliably:
  - routes to the correct frontend locations (Nunjucks, choreography, CSS build scripts)
  - respects the guardrails above without being reminded
  - produces correct, minimal changes for at least 3 canonical tasks
- Evaluation evidence is recorded (AIX metrics, brief notes, links to artifacts).

MVP status:
- Complete; see `docs/logs/2026-01-16-portfolio-frontend-domain-mvp-evidence.md`.

## Evaluation Plan (AIX)
Use the AIX scorecard in `aix/specs/performance/aix.md`.

Minimum evaluation set (first-response emphasized):
1) Add a small Nunjucks macro component under `frontend/njk/_includes/`.
2) Update a GSAP section controller without breaking Director initialization.
3) Add/adjust an 11ty collection or filter under `frontend/eleventy/`.

Record:
- FRA/CR/HF/CUS/TTUO
- which sources were used
- any drift or broken-link findings

## Risks
- Drift between platform docs and frontend docs if we copy content instead of linking.
- Over-scoping the “domain agent” into multiple responsibilities; keep it narrow and constraint-first.

## Open Questions
- Should the domain module live only in `aix/`, or should we also create a project-local agent in `frontend/.github/agents/` for direct usage?
- Where should the probe bank live long-term (`aix/specs/ai/` vs `aix/data/`)?
