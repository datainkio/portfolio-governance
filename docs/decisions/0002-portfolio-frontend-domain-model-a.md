# ADR 0002: Portfolio Frontend Domain Module Uses Internal Routing (Model A)

- **Status:** accepted
- **Date:** 2026-01-16
- **Owners:** Russell

## Context
We want a domain-specialized module for the portfolio frontend (11ty + Nunjucks + Tailwind v4 + GSAP + Airtable + Sanity) that reduces mistakes and enforces project guardrails. The module now lives in the mounted project at `frontend/.copilot/prompts/domain.prompt.md`.

A question arose: should the new `portfolio-frontend-domain` module act as a router in the same sense as Concierge (i.e., Concierge routes to the domain module, then the domain module routes again to sub-prompts like Nunjucks/Tailwind/11ty)?

Constraints:
- Concierge is the only registered Copilot Chat entrypoint and remains the primary router.
- We want low drift and low confusion in a multi-root workspace.

## Options considered
1) **Model A (internal routing map):** Keep `portfolio-frontend-domain` as a single module with an explicit internal decision tree (Nunjucks vs Tailwind vs choreography vs Eleventy vs content).
2) **Model B (module fan-out):** Split into multiple narrow frontend modules and have Concierge route directly to the right one.
3) **Two-hop routing:** Concierge routes to `portfolio-frontend-domain`, which then routes as a second router to sub-modules.

## Decision
Adopt **Model A**.

- Concierge remains the only “true router” that selects modules.
- `portfolio-frontend-domain` provides a clear internal classification map and applies the correct guardrails for the selected area(s), without acting like a peer router.

## Consequences
**Positive**
- Fewer routing hops → lower confusion and less instruction drift.
- One place to enforce cross-domain frontend guardrails.
- Works well for requests spanning multiple frontend areas (templates + CSS + choreography).

**Negative / tradeoffs**
- The single module may grow; we must keep internal routing concise and avoid duplicating repo documentation.
- For deeply specialized requests, we may still benefit from dedicated modules later (selected directly by Concierge).

## Related
- [Spec: Domain-Specialized AI Coding Agent](../../specs/ai/domain-specialized-coding-agent.spec.md)
- [Prompt module: frontend domain](../../../frontend/.copilot/prompts/domain.prompt.md)
