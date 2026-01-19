# Current Goals

This file is the single-source-of-truth for what matters *right now*.
Last updated: 2026-01-18T18:45:00Z

## Now
- Address weaknesses of determining freshness by timestamp. Requires user input, which will lead to false negatives when forgotten.
- Develop the spec for an animation-focused Concierge module based on specs/animation/choreographer.animation-spec.md
- Publish browser-accessible documentation (MkDocs Material + GitHub Pages) — see [specs/features/brower-accessible-documentation.md](specs/features/brower-accessible-documentation.md)

## Next
- Define and document command permissions (e.g. zsh) to streamline agent work
- Develop MVP through iteration.
- Optimize frontend by moving agents out and integrating into aix repo.
- Complete Sanity adoption (full separation from Airtable).
- Draft and iterate on the Sanity adoption spec (`specs/cms/sanity-adoption.md`).
- Iterate on the frontend domain module (post-MVP refinements).
- Create 11ty pages for rapid iterating on the UX of landing page section design (e.g. Hero, Bio, Organizations, etc.).

## Done (recent)
- Confirm implementation of status bar action buttons for VS Code tasks

## Not Now
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
