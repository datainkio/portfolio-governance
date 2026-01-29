---
aix:
  id: aix.context.current-goals
  role: Time-bound priorities for the workspace.
  status: stable
  surface: internal
  owner: AIX
  tags:
    - goals
    - priorities
    - context
  type: context
  scope: aix
  audience: maintainers
  perf:
    readPriority: high
    cacheSafe: true
    critical: true
tags:
  - content-strategy
  - aix
---

# Current Goals

This file is the single-source-of-truth for what matters *right now*.

## Now
- Refactor TaskManager module to focus on GitHub Issues
  - rewrite spec
    - remove conversation flow as source of tasks
    - replace with GitHub Action "TODO to Issue"
  - update code
  - <!-- BUG: TTODO-to-Issue workflow fails in current-goals.md -->
  - document
- Move the landing page XD forward in progress
  - Address 404 errors
  - Create Singleton for landing page
- Document coding conventions and standards.
	- Generate a tag taxonomy for easy findability and discovery
	- Establish a frontmatter schema

## Next
- Define and document command permissions (e.g. zsh) to streamline agent work
- Develop MVP through iteration.
- Optimize frontend by moving agents out and integrating into aix repo.
- Complete Sanity adoption (full separation from Airtable).
- Draft and iterate on the Sanity adoption spec (`specs/cms/sanity-adoption.md`).
- Iterate on the frontend domain module (post-MVP refinements).
- Create 11ty pages for rapid iterating on the UX of landing page section design (e.g. Hero, Bio, Organizations, etc.).

## Done (recent)
- Confirm adherence to choreographer spec. Test by defining animations for homepage sections.
- Address poor agent performance when editing files. For example, the inability to edit a file without requiring multiple steps, failures, file corruptions, and excessive amounts of time just to plan.
- Developed frontmatter schema for JS files and applied across AIX + frontend (spec: [specs/features/js-frontmatter-schema.md](../specs/features/js-frontmatter-schema.md))
- Completed animation-focused Concierge module spec and prompt module; routing entry added.
- Removed inline "Last updated" stamps; codified repo-signal freshness policy; set context baseline at HEAD after verification.
- Confirm implementation of status bar action buttons for VS Code tasks

## Not Now
- Develop the browser-accessibile-documentation spec for making documentation available to remote agents
- Improve drift gate messaging surfaced by VS Code (keep it short and actionable)
- Auto-generated global inventories (a full ToC of every log file) in the workspace map.
- Heavy automation for logging/indexing until the evidence loop stabilizes and proves it saves time.
- Broad refactors inside mounted projects in the name of “cleanup” (unless explicitly approved).
- Remove non-fatal Tailwind watch shutdown noise (console error when stopping dev server)
- Establish a lightweight AIX evidence loop:
	- Run a small probe set after context refreshes.
	- Record a dated snapshot in `docs/logs/` with outcomes + links.
- Standardize project log naming and structure across mounted repos:
	- `docs/logs/projects/<project-slug>/YYYY-MM-DD-<topic>.md`
	- Keep a short per-project README describing what’s inside.

## Notes
- Keep this list short (3–7 bullets per section).
- If a goal becomes stable/durable, promote it into a spec under `specs/`.

### What “good” looks like (AIX-first)

- Lower TTUO: it’s obvious where to put/find Concierge outputs.
- Lower CR: fewer ambiguous agent choices and fewer competing sources of truth.
- Higher CUS: reports consistently cite the relevant constraints, runbooks, and artifacts.
- Less drift: navigation pointers stay stable; detailed inventories live near the thing they index (or are generated).
