# Workspace Scripts

This folder contains small utility scripts used to support development, automation,
and maintenance tasks across the workspace.

Scripts should be safe to run locally, documented inline, and avoid hard-coded paths
when possible. When a script is required for a workflow, it should be referenced from
a task, runbook, or agent workflow.

## Scripts

### mounted-project-aix-audit.mjs

Report-only, dependency-free discovery runner that writes timestamped audit artifacts into a mounted project.

- Usage: `node scripts/mounted-project-aix-audit.mjs --project /absolute/path/to/mounted/project --probeSubset MP`
- Output (default): `/project-root/docs/ai/audits/<timestamp>--aix-audit--MP.md` and `/project-root/docs/ai/audits/<timestamp>--aix-snapshot--MP.json`
- Notes:
	- The manifest is optional; if present, its `auditsDir` hint is used when possible.
	- This runner is discovery-only (no LLM scoring) and does not modify existing project files.