# Project Context: Portfolio Frontend (11ty + Nunjucks + Tailwind + GSAP)

## Scope
This context note exists to help the **platform scaffold Concierge** and its prompt modules work effectively when this workspace includes the portfolio frontend as a second root.

It is not trying to re-document the frontend repo; it captures only the high-signal constraints that improve routing and reduce hallucination.

## What this project is
- Static site generated with **Eleventy (11ty)**
- Templates authored in **Nunjucks** under `njk/`
- Styling via **Tailwind v4** + generated design tokens (Figma sync)
- Content fetched at build-time from **Airtable** (collections)
- Motion system implemented with **GSAP** (Director/sections/triggers)

## Authoritative AI surfaces (project-local)
When editing files inside the frontend repo, prefer its file-scoped constraints:
- `frontend/.copilot/js.prompt.md`: browser-first JS, progressive enhancement, idempotent initialization
- `frontend/.copilot/html.prompt.md`: Nunjucks/11ty semantics, minimal template logic
- `frontend/.copilot/README.md`: prompt scoping and precedence rules

## Multi-root authority boundary (platform vs project)
In the combined workspace:
- The scaffold is the authority for:
  - agent routing policy and output schema
  - cross-workspace AIX measurement and logging conventions
  - workspace-wide hygiene standards
- The frontend is the authority for:
  - 11ty/Nunjucks/Tailwind/GSAP implementation conventions inside the frontend codebase
  - project-specific AIX guardrails (prompt scope, local checklists)

If there is a conflict, defer to:
1) file-scoped prompts for the file type being edited (project-local)
2) scaffold routing and AIX measurement (platform-level)

## Choreography workflow (recommended)
1) Use the project agent **Frontend Choreography Planner** (`frontend/.github/agents/choreography-planner.agent.md`) to produce a choreography plan/spec.
2) After approval, implement using either:
  - the project agent **Frontend Choreography Implementer** (`frontend/.github/agents/choreography-implementer.agent.md`), or
  - the scaffold implementation module (`.copilot/prompts/implementer.prompt.md`) if you want a general “edit files + validate” workflow.
3) While implementing, follow frontend `.copilot/*` constraints and reuse the existing GSAP architecture (Director → sections → triggers/animations).

## Common pitfalls to avoid
- Don’t infer behavior from `frontend/_site/` output (generated).
- Don’t introduce SPA assumptions into 11ty pages.
- Don’t bypass the existing choreography lifecycle by creating new global singletons.
- Don’t copy/paste “platform AIX docs” into the frontend or vice versa—prefer links/pointers to prevent drift.
