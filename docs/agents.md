# Agent Index

Concierge is the only agent registered in Copilot Chat; it routes to specialists.
Copilot Chat discovers Concierge via [copilot-agents.json](../copilot-agents.json) and loads the entrypoint in [.github/agents/Concierge.md](../.github/agents/Concierge.md).

Concierge occasionally emits a ceremonial callout (p = 1/6) before the standard response when the user sends a short advance/continue confirmation; see [specs/ai/ceremonial-response-spec.md](../specs/ai/ceremonial-response-spec.md) for the gate and phrase pools.

## Agents
- Concierge — router; classifies intent and emits handoff requests. Entrypoint: [.github/agents/Concierge.md](../.github/agents/Concierge.md); Prompt: [.copilot/prompts/concierge.prompt.md](../.copilot/prompts/concierge.prompt.md)

## Specialist Modules (selected by Concierge)
- Housekeeper — hygiene/excludes/drift; logs AIX snapshots. Prompt module: [.copilot/prompts/housekeeper.prompt.md](../.copilot/prompts/housekeeper.prompt.md); Role/workflow notes: [docs/agent-roles-and-workflows.md](agent-roles-and-workflows.md)
- Navigator — context concierge; assembles minimal sources and flags drift. Prompt module: [.copilot/prompts/navigator.prompt.md](../.copilot/prompts/navigator.prompt.md)
- Librarian — documentation steward; keeps docs/runbooks/decisions fresh and linked. Prompt module: [.copilot/prompts/librarian.prompt.md](../.copilot/prompts/librarian.prompt.md)
- Analyst — AIX observer; runs probes and records FRA/CR/HF/TTUO/CUS. Prompt module: [.copilot/prompts/analyst.prompt.md](../.copilot/prompts/analyst.prompt.md)
- Architect — structure/decisions. Prompt module: [.copilot/prompts/architect.prompt.md](../.copilot/prompts/architect.prompt.md)
- Mechanic — build/CI failures. Prompt module: [.copilot/prompts/mechanic.prompt.md](../.copilot/prompts/mechanic.prompt.md)
- Editor — narrative/doc writing. Prompt module: [.copilot/prompts/editor.prompt.md](../.copilot/prompts/editor.prompt.md)
- Migrator — scaffold migration/upgrades; audits differences, applies safe updates, writes changelogs. Prompt module: [.copilot/prompts/migrator.updater.prompt.md](../.copilot/prompts/migrator.updater.prompt.md); Guide: [docs/migration.md](../docs/migration.md)

## Project Domain Modules (selected by Concierge when in-scope)
- Portfolio Frontend Domain — frontend implementation guardrails (11ty/Nunjucks/Tailwind v4/GSAP/Airtable/Sanity). Prompt module: [frontend/.copilot/prompts/domain.prompt.md](../../frontend/.copilot/prompts/domain.prompt.md)
- Portfolio Frontend — Choreography Planning — plan-only module for motion timelines/triggers/a11y in `frontend/`. Prompt module: [frontend/.copilot/prompts/choreography-planning.prompt.md](../../frontend/.copilot/prompts/choreography-planning.prompt.md)
- Portfolio Frontend — Choreography Implementation — implement approved choreography plans in `frontend/`. Prompt module: [frontend/.copilot/prompts/choreography-implementation.prompt.md](../../frontend/.copilot/prompts/choreography-implementation.prompt.md)

Note: some projects may include their own domain-specific agents (e.g., choreography or framework-specific helpers). Prefer the project context packs under `context/projects/`.


## When to Use Which
- Start with Concierge; it will route.
- Housekeeper: quick hygiene scan, pre-PR hygiene, post-refresh AIX snapshot, align gitignore/excludes.
- Navigator: gather authoritative context before coding/reviewing; detect drift between /context and /.copilot/context.
- Librarian: fix or update docs/runbooks/decisions, repair links, align commands to current scripts.
- Analyst: measure AIX after refresh or before releases; flag regressions.
- Architect: decide structure/routes/CMS schema; outline options.
- Mechanic: unblock failing builds/CI/runtime with minimal changes.
- Editor: draft/revise narrative docs/portfolio text.
- Migrator: audit or upgrade an existing project to a newer vitaixmen version; generate migration plans and changelogs; never touches application code unless explicitly requested.


## Copy/Paste Prompts (project-specific)
- Concierge: "Classify and hand off: fix failing 11ty build referencing missing layout; include next steps." 
- Concierge: "Route: plan GSAP animations for homepage hero; note perf/a11y constraints." 
- Housekeeper: "Run a quick hygiene scan for root + frontend + backend; ensure excludes cover .obsidian/, node_modules/, frontend/_site/, backend/.sanity/; list fixes with links." 
- Navigator: "Assemble a minimal context pack for adding a new Eleventy collection; include routing/build outputs to avoid and any relevant decisions." 
- Librarian: "Update docs/runbooks/refresh-ai-context.md after the latest build command changes; fix broken links you find." 
- Analyst: "Run simple + complex probes (describe frontend build outputs; outline adding a Sanity content type), score FRA/CR/HF/TTUO/CUS per specs/performance/aix.md, and log in docs/logs." 
- Architect: "Recommend folder/route structure for a new marketing page with Sanity-driven sections; give options/criteria." 
- Mechanic: "Diagnose the 11ty build error about missing layout; propose minimal fix with file/line references." 
- Editor: "Tighten the README intro to emphasize hygiene and agent workflow." 
- Migrator: "Audit this project against the latest vitaixmen and summarize safe vs review-required updates."
- Migrator: "Apply safe scaffold updates only (VS Code settings + agent prompts) and write a changelog."

## Key Cadence
- After every context refresh: run drift sweep, regenerate curated context (if used), then log an AIX snapshot (FRA/CR/HF/TTUO/CUS) under [docs/logs](logs/README.md#L1-L21).
- Weekly or pre-PR: run Housekeeper’s quick scan; fix excludes and doc pointers.

## Starting Points
- Context truth: [context/README.md](../context/README.md)
- Curated map: [.copilot/context/workspace-map.md](../.copilot/context/workspace-map.md)
- AIX spec: [specs/performance/aix.md](../specs/performance/aix.md)
- Refresh runbook: [docs/runbooks/refresh-ai-context.md](../docs/runbooks/refresh-ai-context.md)
- Workspace migration guide: [docs/migration.md](../docs/migration.md)

## Useful Links
- Context truth: [context/README.md](../context/README.md)
- Workspace map: [.copilot/context/workspace-map.md](../.copilot/context/workspace-map.md)
- AIX spec: [specs/performance/aix.md](../specs/performance/aix.md)
- Logs folder: [docs/logs/](logs/README.md)
