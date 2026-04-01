# Project Context: Portfolio Frontend (11ty + Nunjucks + Tailwind v4 + GSAP + Airtable + Sanity)

## Scope

This context note exists to help the **platform scaffold Concierge** and its prompt modules work effectively when this workspace includes the portfolio frontend as a second root.

It is not trying to re-document the frontend repo; it captures only the high-signal constraints that improve routing and reduce hallucination.

## What this project is

- Static site generated with **Eleventy (11ty)**
- Templates authored in **Nunjucks** under `njk/`
- Styling via **Tailwind v4** + generated design tokens (Figma sync)
- Content fetched at build-time from **Airtable** (collections)
- Motion system implemented with **GSAP** (Director/sections/triggers)

## Recent changes (2026-04-01)

- A domain-specific module exists for implementing frontend work with strict guardrails: `aix/.copilot/prompts/portfolio-frontend-domain.prompt.md`.
- Routing model is **Model A**: Concierge remains the only router; the domain module contains an internal “signals table” for quick classification.
- Default local dev constraint: prefer `npm run start:nobundle` until explicitly re-enabling choreography bundling.
- MVP evidence log: `aix/docs/logs/2026-01-16-portfolio-frontend-domain-mvp-evidence.md`.
- Decision record: `aix/docs/decisions/0002-portfolio-frontend-domain-model-a.md`.

## Runtime truth snapshot (landing choreography)

- Choreography config entrypoint is `frontend/js/choreography/config/index.js` (not `config/runtime.js`).
- Canonical event contract lives in `frontend/js/choreography/config/events.js`.
- `AnimationDirector` boot is deferred (`requestIdleCallback` with timeout fallback) in `frontend/js/choreography/AnimationDirector.js`.
- Preloader-runtime handshake:
  - `AnimationDirector` dispatches `director:ready` on `window` after system init.
  - `frontend/js/preloader.js` waits for that signal before exit.
  - Preloader then emits `preloader:out`, which `LandingSequence` listens for to start sequence playback.
- Active section registry (auto-initialized by Director) is currently `hero`, `video`, `bio`, `awards` in `frontend/js/choreography/sections/registry.js`.
- Event namespaces for `organizations` and `work` exist in `events.js`, but no active section controller is registered for them.
- Gel arrangement mapping currently covers `hero`, `bio`, and `awards` (`frontend/js/choreography/config/arrangements.js`).

## Authoritative AI surfaces (project-local)

When editing files inside the frontend repo, prefer its file-scoped constraints:

- `frontend/.copilot/js.prompt.md`: browser-first JS, progressive enhancement, idempotent initialization
- `frontend/.copilot/html.prompt.md`: Nunjucks/11ty semantics, minimal template logic
- `frontend/.copilot/README.md`: prompt scoping and precedence rules
- `frontend/.github/copilot-instructions.md`: repo-wide conventions and critical gotchas
- `frontend/.copilot/prompts/index.md`: project-local prompt catalog (templates, choreography, JS)

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

1. file-scoped prompts for the file type being edited (project-local)
2. scaffold routing and AIX measurement (platform-level)

## Choreography workflow (recommended)

1. Use **Frontend — Choreography Planning** (`frontend/.copilot/prompts/choreography-planning.prompt.md`) to produce a choreography plan/spec.
2. After approval, implement using:

- **Frontend — Choreography Implementation** (`frontend/.copilot/prompts/choreography-implementation.prompt.md`), or
- the frontend domain module (`frontend/.copilot/prompts/domain.prompt.md`) if the work spans multiple areas.

3. While implementing, follow frontend `.copilot/*` constraints and reuse the existing GSAP architecture (Director → sections → triggers/animations).
4. Treat runtime event sequencing as a contract:

- do not bypass `director:ready` / `preloader:out` gating
- keep orchestration on `AnimationBus` via constants from `config/events.js`
- avoid adding direct section-to-section calls when a bus event is appropriate

## Common pitfalls to avoid

- Don’t infer behavior from `frontend/_site/` output (generated).
- Don’t introduce SPA assumptions into 11ty pages.
- Don’t bypass the existing choreography lifecycle by creating new global singletons.
- Don’t reintroduce stale config path references (`config/runtime.js`); use `config/index.js` and specific config modules.
- Don’t hand-edit Figma-generated token files (they’re overwritten by design sync).
- Don’t copy/paste “platform AIX docs” into the frontend or vice versa—prefer links/pointers to prevent drift.
