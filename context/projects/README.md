This folder holds project-scoped context packs. Use it to keep per-project goals, constraints, and decisions that should not live in the global context.

Guidelines:
- One subfolder per project; keep names stable and descriptive (e.g., `frontend`, `backend`, `site-refresh`).
- Include only the minimal context needed for agents/humans to operate that project (goals, constraints, recent decisions, links to canonical docs).
- Avoid duplicating global context; link to shared files in `/context` or `/specs` instead of copying.
- If a project has its own repo, prefer linking to its in-repo sources of truth and state what must be mounted.

Suggested contents per project:
- `README.md` overview with owner, scope, and canonical links.
- Current goals / constraints snippets (or pointers to where they live).
- Pointers to ADRs/runbooks/playbooks that the project depends on.

Maintenance:
- Update when project-level goals or constraints change; keep this folder lean to avoid drift from the canonical sources.
