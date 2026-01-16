# Portfolio Frontend Domain Module — MVP Evidence (AIX) — 2026-01-16

Scope: Multi-root workspace evaluation for **frontend-domain work routed through Concierge modules**. This log covers the new module in `aix/.copilot/prompts/` and its observed behavior while implementing changes in `frontend/`.

Evidence sources:
- AIX rubric: [../../specs/performance/aix.md](../../specs/performance/aix.md)
- Domain spec: [../../specs/ai/domain-specialized-coding-agent.md](../../specs/ai/domain-specialized-coding-agent.md)
- Probe bank: [../../specs/ai/domain-agent-probes.md](../../specs/ai/domain-agent-probes.md)
- Project boundary context: [../../context/projects/portfolio-frontend.md](../../context/projects/portfolio-frontend.md)
- Domain module: [../../.copilot/prompts/portfolio-frontend-domain.prompt.md](../../.copilot/prompts/portfolio-frontend-domain.prompt.md)

Constraint discovered mid-run:
- Avoid choreography bundling in local dev: prefer `npm run start:nobundle` (no `assets/js/choreography/bundle.js`) until explicitly re-enabled.

---

## A. Artifacts created/updated

### Platform (aix)
- Domain spec: [../../specs/ai/domain-specialized-coding-agent.md](../../specs/ai/domain-specialized-coding-agent.md)
- Domain module: [../../.copilot/prompts/portfolio-frontend-domain.prompt.md](../../.copilot/prompts/portfolio-frontend-domain.prompt.md)
- Module index updated: [../../.copilot/prompts/_module-index.md](../../.copilot/prompts/_module-index.md)
- Router contract tightened (domain-module selection rule): [../../.copilot/prompts/concierge.prompt.md](../../.copilot/prompts/concierge.prompt.md)
- Probe bank created: [../../specs/ai/domain-agent-probes.md](../../specs/ai/domain-agent-probes.md)

### Project (frontend)
- New Nunjucks molecule macro: [../../../frontend/njk/_includes/molecules/callout.njk](../../../frontend/njk/_includes/molecules/callout.njk)
- Demo usage page updated: [../../../frontend/njk/_pages/dev-components.njk](../../../frontend/njk/_pages/dev-components.njk)
- Hero intro completion fix (reliable bus emission): [../../../frontend/js/choreography/sections/hero/Hero.js](../../../frontend/js/choreography/sections/hero/Hero.js)
- Landing sequence logs enabled for hero intro start/complete: [../../../frontend/js/choreography/sequences/landing/LandingSequence.js](../../../frontend/js/choreography/sequences/landing/LandingSequence.js)
- New date filter: `formatDate`: [../../../frontend/eleventy/filters/date.js](../../../frontend/eleventy/filters/date.js)
- Dev command guidance updated (start:nobundle as default): [../../../frontend/README.md](../../../frontend/README.md)

---

## B. Probe outcomes (today)

### Probe 1 — Nunjucks macro component
Prompt: “Add a new reusable Nunjucks macro component in the portfolio frontend and show me how to import and use it on a page.”

Outcome:
- Implemented molecule macro `callout` and demonstrated import/usage on `/dev/components/`.

AIX notes:
- FRA: correct first implementation.
- CR: 0 blocking clarifications.
- HF: 0 (no invented files/sections in the final output).
- TTUO: within target.
- CUS: strong (used correct atomic design location and demonstrated real usage).

---

### Probe 2 — GSAP section controller intro completion event
Prompt: “Update an existing GSAP section controller to emit an AnimationBus event when its intro completes, without breaking Director initialization.”

Outcome:
- Fixed Hero intro completion emission by overriding `playIntro()` to `tweenTo('intro:end')`, ensuring `EVENTS.hero.introComplete` fires at the intended pause boundary.
- Added LandingSequence logs for `EVENTS.hero.introStart` and `EVENTS.hero.introComplete` for verification.

AIX notes:
- FRA: correct solution for GSAP timeline pause semantics.
- CR: 0 blocking clarifications.
- HF: 0 in user-facing output.
- TTUO: within target.
- CUS: strong (aligned with existing choreography architecture).

---

### Probe 3 — 11ty filter (consistent date formatting)
Prompt: “Add an Eleventy filter that formats a date consistently across templates, and wire it into the 11ty config where filters live in this repo.”

Outcome:
- Added Luxon-backed `formatDate` filter and demonstrated it on `/dev/components/`.

AIX notes:
- FRA: correct.
- CR: 0 blocking clarifications.
- HF: 0.
- TTUO: within target.
- CUS: strong (used existing filter registration pattern).

---

## C. Metric summary (directional)

- FRA: 100% (3/3 probes completed correctly)
- CR: 0% (0 blocking clarifications)
- HF: 0% (0 hallucinated references in final outputs)
- TTUO: within targets (simple tasks resolved quickly)
- CUS: high (consistent use of authoritative project structure + conventions)

Caveat:
- “bundle.js avoidance” constraint emerged mid-run; guidance was updated immediately after discovery.

---

## D. Verification steps used

- Dev workflow (current default): `npm run start:nobundle`
- Verification URLs:
  - Component + filter demo: `http://localhost:8080/dev/components/`

---

## E. Follow-ups

- Run Probe 4 (Tailwind workflow guardrail) and Probe 5 (multi-root boundary doc placement) to complete the MVP probe set.
- Consider adding a short “How to Verify (default)” block to the probe bank referencing `npm run start:nobundle`.
