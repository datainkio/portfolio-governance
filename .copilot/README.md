# Copilot & AI Assistant Configuration

This folder defines how AI assistants should operate within this workspace.

It contains instructions, prompts, and curated context designed to help agents
understand the project structure, conventions, and expectations with minimal setup
and minimal noise.

Contents here are optimized for repeated ingestion by AI tools and may summarize or
link to canonical materials elsewhere in the workspace.

If conflicts arise, defer to canonical context in `/aix/context/` and canonical specs in `/aix/specs/`.

Root entrypoint: start at [README.md](../../README.md) for the workspace-level AIX jump table.

## Key files

- Routing canon: [.copilot/ROUTING.md](ROUTING.md)
- Router contract: [.copilot/prompts/concierge.prompt.md](prompts/concierge.prompt.md)
- Curated agent context: [.copilot/context/README.md](context/README.md)
- Workspace map: [.copilot/context/workspace-map.md](context/workspace-map.md)

## Prompt modules

- Module index: [.copilot/prompts/\_module-index.md](prompts/_module-index.md)
- Concierge: [.copilot/prompts/concierge.prompt.md](prompts/concierge.prompt.md)
- Analyst: [.copilot/prompts/analyst.prompt.md](prompts/analyst.prompt.md)
- Architect: [.copilot/prompts/architect.prompt.md](prompts/architect.prompt.md)
- Content Strategist: [.copilot/prompts/content-strategist.prompt.md](prompts/content-strategist.prompt.md)
- Editor: [.copilot/prompts/editor.prompt.md](prompts/editor.prompt.md)
- Housekeeper: [.copilot/prompts/housekeeper.prompt.md](prompts/housekeeper.prompt.md)
- Implementer: [.copilot/prompts/implementer.prompt.md](prompts/implementer.prompt.md)
- Librarian: [.copilot/prompts/librarian.prompt.md](prompts/librarian.prompt.md)
- Mechanic: [.copilot/prompts/mechanic.prompt.md](prompts/mechanic.prompt.md)
- Migrator Updater: [.copilot/prompts/migrator.updater.prompt.md](prompts/migrator.updater.prompt.md)
- Navigator: [.copilot/prompts/navigator.prompt.md](prompts/navigator.prompt.md)
- Planner: [.copilot/prompts/planner.prompt.md](prompts/planner.prompt.md)
- Reviewer: [.copilot/prompts/reviewer.prompt.md](prompts/reviewer.prompt.md)
- Taskmaster: [.copilot/prompts/taskmaster.prompt.md](prompts/taskmaster.prompt.md)

## Notes

- Concierge is the only user-facing agent in this workspace.
- Mounted project modules can be routed when stack/context signals match (see the module index for current mounted sources).
