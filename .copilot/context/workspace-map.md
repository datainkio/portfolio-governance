# Workspace Map
This file describes where everything lives in the workspace and what each folder contains.
Focus: keep AI agents oriented and fast.

This workspace includes multiple sibling repos: `aix/` (AIX scaffold), `frontend/`, and `backend/`.

## Workspace Roots (repo-level)
- [aix/](../../../aix/) — AIX scaffold, docs, specs, and agent workflows.
- [frontend/](../../../frontend/) — frontend project (11ty + Nunjucks + Tailwind + GSAP).
- [backend/](../../../backend/) — backend/CMS tooling and schemas.
- [notes/](../../../notes/) — workspace notes.

## Copilot Configuration
- Copilot/agent configuration hub: [.copilot/README.md](../README.md)
- Routing canon: [.copilot/ROUTING.md](../ROUTING.md)
- Prompt modules:
	- Architect: [.copilot/prompts/architect.prompt.md](../prompts/architect.prompt.md)
	- Editor: [.copilot/prompts/editor.prompt.md](../prompts/editor.prompt.md)
	- Housekeeper: [.copilot/prompts/housekeeper.prompt.md](../prompts/housekeeper.prompt.md)
	- Implementer: [.copilot/prompts/implementer.prompt.md](../prompts/implementer.prompt.md)
	- Librarian: [.copilot/prompts/librarian.prompt.md](../prompts/librarian.prompt.md)
	- Mechanic: [.copilot/prompts/mechanic.prompt.md](../prompts/mechanic.prompt.md)
	- Navigator: [.copilot/prompts/navigator.prompt.md](../prompts/navigator.prompt.md)
	- Planner: [.copilot/prompts/planner.prompt.md](../prompts/planner.prompt.md)
	- Reviewer: [.copilot/prompts/reviewer.prompt.md](../prompts/reviewer.prompt.md)

## Canonical Context (source of truth)
- [context/README.md](../../context/README.md) — what “context” means and why it’s authoritative.
- Key canonical files (all in [context/](../../context/)):
	- [context/project.md](../../context/project.md) — project intent / north star
	- [context/design-philosophy.md](../../context/design-philosophy.md) — guiding principles
	- [context/constraints.md](../../context/constraints.md) — non-negotiables
	- [context/decisions.md](../../context/decisions.md) — decisions / ADR-style notes
	- [context/example-context.md](../../context/example-context.md) — example pattern
	- [context/current-goals.md](../../context/current-goals.md) — single page of “what matters right now”.

## Curated Agent Context (orientation layer)
- [.copilot/context/README.md](README.md) — what this curated layer is.
- Curated files (keep short, point to canonical truth):
	- [.copilot/context/workspace-map.md](workspace-map.md) — this map
	- [.copilot/context/coding-standards.md](coding-standards.md) — stub (fill when a project is attached)
	- [.copilot/context/stack-and-commands.md](stack-and-commands.md) — stub (fill when a project is attached)

## Specs (contracts)
- [specs/README.md](../../specs/README.md) — what “specs” are and how to use them.
- Specs are organized by topic folders under [specs/](../../specs/):
	- AI specs:
		- [specs/ai/context-drift-without-timestamps.spec.md](../../specs/ai/context-drift-without-timestamps.spec.md)
		- [specs/ai/documentation-steward.spec.md](../../specs/ai/documentation-steward.spec.md)
		- [specs/ai/ceremonial-response-spec.md](../../specs/ai/ceremonial-response-spec.md)
		- [specs/ai/domain-agent-probes.spec.md](../../specs/ai/domain-agent-probes.spec.md)
		- [specs/ai/domain-specialized-coding-agent.spec.md](../../specs/ai/domain-specialized-coding-agent.spec.md)
	- Animation (frontend-owned):
			- [frontend/specs/animation/README.md](../../../frontend/specs/animation/README.md)
			- [frontend/specs/animation/template.md](../../../frontend/specs/animation/template.md)
			- [frontend/specs/animation/motion-accessibility-policy.md](../../../frontend/specs/animation/motion-accessibility-policy.md)
	- Architecture: [specs/architecture/](../../specs/architecture/)
		- [specs/architecture/README.md](../../specs/architecture/README.md)
		- [specs/architecture/template.md](../../specs/architecture/template.md)
	- Components: [specs/components/](../../specs/components/)
		- [specs/components/README.md](../../specs/components/README.md)
		- [specs/components/template.md](../../specs/components/template.md)
	- Routes/content: [specs/routes-content/](../../specs/routes-content/)
		- [specs/routes-content/README.md](../../specs/routes-content/README.md)
		- [specs/routes-content/template.md](../../specs/routes-content/template.md)
	- CMS: [specs/cms/](../../specs/cms/)
		- [specs/cms/README.md](../../specs/cms/README.md)
		- [specs/cms/template.md](../../specs/cms/template.md)
	- Data: [specs/data/](../../specs/data/)
		- [specs/data/README.md](../../specs/data/README.md)
		- [specs/data/template.md](../../specs/data/template.md)
	- UX (has real docs): [specs/ux/](../../specs/ux/)
		- [specs/ux/README.md](../../specs/ux/README.md)
		- [specs/ux/accessibility.md](../../specs/ux/accessibility.md)
		- [specs/ux/design-system.md](../../specs/ux/design-system.md)
		- [specs/ux/interactions.md](../../specs/ux/interactions.md)
		- [specs/ux/template.md](../../specs/ux/template.md)
	- Features:
		- [specs/features/README.md](../../specs/features/README.md)
		- [specs/features/adr-spec-sync.spec.md](../../specs/features/adr-spec-sync.spec.md)
		- [specs/features/concierge-mounted-project-aix.md](../../specs/features/concierge-mounted-project-aix.md)
		- [specs/features/concierge-project-aix.todo.md](../../specs/features/concierge-project-aix.todo.md)
		- [specs/features/js-frontmatter-schema.md](../../specs/features/js-frontmatter-schema.md)
		- [specs/features/template.md](../../specs/features/template.md)
	- Performance (AIX spec lives here): [specs/performance/aix.md](../../specs/performance/aix.md)
		- [specs/performance/README.md](../../specs/performance/README.md)
		- [specs/performance/template.md](../../specs/performance/template.md)

## Docs (narrative, non-canonical)
- [docs/README.md](../../docs/README.md) — human-facing narrative notes (not authoritative by default).
- Key doc entrypoints:
	- Agent index: [docs/agents.md](../../docs/agents.md)
	- AI audits: [docs/ai/audits/README.md](../../docs/ai/audits/README.md)
	- Changes: [docs/changes/README.md](../../docs/changes/README.md)
	- Runbooks: [docs/runbooks/](../../docs/runbooks/)
		- [docs/runbooks/aix-audit-report.example.md](../../docs/runbooks/aix-audit-report.example.md)
		- [docs/runbooks/optimize-aix-for-frontend.md](../../docs/runbooks/optimize-aix-for-frontend.md)
		- [docs/runbooks/context-freshness.md](../../docs/runbooks/context-freshness.md)
		- [docs/runbooks/current-goals.md](../../docs/runbooks/current-goals.md)
	- Logs (AIX/hygiene + project audits): [docs/logs/](../../docs/logs/)
		- Project log index: [docs/logs/projects/](../../docs/logs/projects/)
		- Project audit outputs live under `docs/logs/projects/<project-slug>/` (example: [docs/logs/projects/frontend/](../../docs/logs/projects/frontend/README.md))
	- Decisions (narrative ADRs): [docs/decisions/](../../docs/decisions/)
		- [docs/decisions/0003-context-freshness-gate.md](../../docs/decisions/0003-context-freshness-gate.md)
	- Maintenance: [docs/maintenance/aix-calibration-plan.md](../../docs/maintenance/aix-calibration-plan.md)
	- Maintenance validation: [docs/maintenance/aix-validation.md](../../docs/maintenance/aix-validation.md)
	- Notes hub: [docs/notes/README.md](../../docs/notes/README.md)
		- [docs/notes/scratch.md](../../docs/notes/scratch.md)

## Scripts
- [scripts/README.md](../../scripts/README.md) — lightweight workspace utilities (keep dependency-free when possible).

## Assets & Data
- [assets/](../../assets/) and [data/](../../data/) exist and are currently empty.
- Assets manifest: [assets/README.md](../../assets/README.md)
- Data manifest: [data/README.md](../../data/README.md)

## Project Context Packs
- Project-specific context lives under [context/projects/](../../context/projects/)
	- Index: [context/projects/README.md](../../context/projects/README.md)
- When you add files, include a small manifest (`README.md` or `manifest.json`) so agents can locate media/data fast.

## Agent Workflows (roles/playbooks)
- [docs/agent-roles-and-workflows.md](../../docs/agent-roles-and-workflows.md) — roles, workflows, and logging expectations.

## Copilot Agent Registration
- [copilot-agents.json](../../copilot-agents.json) — which agent(s) Copilot Chat can see.
- Entrypoints for registered agents live under [.github/agents/](../../.github/agents/).

## Agent Entrypoints (.github)
- [.github/README.md](../../.github/README.md) — agent discovery notes
- Concierge entrypoint: [.github/agents/Concierge.md](../../.github/agents/Concierge.md)
- Welcoming Party entrypoint: [.github/agents/WelcomingParty.md](../../.github/agents/WelcomingParty.md)

## Workspace Config
- [portfolio.code-workspace](../../../portfolio.code-workspace) — VS Code workspace definition.
- AIX workspace: [aix/aix.code-workspace](../../../aix/aix.code-workspace)
- VS Code settings/tasks live in [.vscode/](../../../.vscode/) (includes the “New Project” task).
- Root README: [README.md](../../../README.md) — workspace intent + quick actions.
- Template notes: [template_notes.md](../../../template_notes.md)
- Workspace Copilot instructions: [.github/copilot-instructions.md](../../../.github/copilot-instructions.md)
- Obsidian vault config: [.obsidian/](../../../.obsidian/) (optional; intentionally ignored to avoid editor state creep).

## Agent Roles
- Concierge: router; registered in Copilot; emits handoff requests to specialists.
- Specialists: Housekeeper (hygiene/excludes/AIX logging), Navigator (context packs), Librarian (docs), Analyst (AIX probes), Architect (structure/decisions), Mechanic (build/CI failures), Editor (narrative).

## Agent Notes / Next AIX actions
- Keep [context/current-goals.md](../../context/current-goals.md) current to anchor priorities.
- Fill spec templates starting with [specs/architecture/template.md](../../specs/architecture/template.md) and [specs/components/template.md](../../specs/components/template.md) to reduce ambiguity for generation.
- Add initial runbooks in `docs/runbooks/` for common workflows; link any scripts once added.
- Schedule AIX snapshots after each context refresh; store under `docs/logs/`.