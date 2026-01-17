# Workspace Map
This file describes where everything lives in the Vitaixmen workspace and what each folder contains.
Focus: keep AI agents oriented and fast.

Note: Vitaixmen is a workspace starter (hygiene + docs + agent workflows). It does not include a concrete `/frontend` or `/backend` project by default.

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
	- Architecture: [specs/architecture/](../../specs/architecture/)
	- Components: [specs/components/](../../specs/components/)
	- Routes/content: [specs/routes-content/](../../specs/routes-content/)
	- CMS: [specs/cms/](../../specs/cms/)
	- Data: [specs/data/](../../specs/data/)
	- UX (has real docs): [specs/ux/](../../specs/ux/)
	- Performance (AIX spec lives here): [specs/performance/aix.md](../../specs/performance/aix.md)

## Docs (narrative, non-canonical)
- [docs/README.md](../../docs/README.md) — human-facing narrative notes (not authoritative by default).
- Key doc entrypoints:
	- Agent index: [docs/agents.md](../../docs/agents.md)
	- Runbooks: [docs/runbooks/](../../docs/runbooks/)
	- Logs (AIX/hygiene + project audits): [docs/logs/](../../docs/logs/)
		- Project log index: [docs/logs/projects/](../../docs/logs/projects/)
		- Project audit outputs live under `docs/logs/projects/<project-slug>/` (example: [docs/logs/projects/frontend/](../../docs/logs/projects/frontend/README.md))
	- Decisions (narrative ADRs): [docs/decisions/](../../docs/decisions/)

## Scripts
- [scripts/README.md](../../scripts/README.md) — lightweight workspace utilities (keep dependency-free when possible).

## Assets & Data
- [assets/](../../assets/) and [data/](../../data/) exist and are currently empty.
- When you add files, include a small manifest (`README.md` or `manifest.json`) so agents can locate media/data fast.

## Agent Workflows (roles/playbooks)
- [docs/agent-roles-and-workflows.md](../../docs/agent-roles-and-workflows.md) — roles, workflows, and logging expectations.

## Copilot Agent Registration
- [copilot-agents.json](../../copilot-agents.json) — which agent(s) Copilot Chat can see.
- Entrypoints for registered agents live under [.github/agents/](../../.github/agents/).

## Workspace Config
- [vitaixmen.code-workspace](../../vitaixmen.code-workspace) — VS Code workspace definition.
- VS Code settings/tasks live in [.vscode/](../../.vscode/) (includes the “New Project” task).
- Root README: [README.md](../../README.md) — scaffold intent + quick actions.
- Obsidian vault config: `.obsidian/` (optional; intentionally ignored to avoid editor state creep).

## Agent Roles
- Concierge: router; registered in Copilot; emits handoff requests to specialists.
- Specialists: Housekeeper (hygiene/excludes/AIX logging), Navigator (context packs), Librarian (docs), Analyst (AIX probes), Architect (structure/decisions), Mechanic (build/CI failures), Editor (narrative).

## Agent Notes / Next AIX actions
- Keep [context/current-goals.md](../../context/current-goals.md) current to anchor priorities.
- Fill spec templates starting with [specs/architecture/template.md](../../specs/architecture/template.md) and [specs/components/template.md](../../specs/components/template.md) to reduce ambiguity for generation.
- Add initial runbooks in `docs/runbooks/` for common workflows; link any scripts once added.
- Schedule AIX snapshots after each context refresh; store under `docs/logs/`.