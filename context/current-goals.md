# Current Goals

This file is the single-source-of-truth for what matters *right now*.

Last updated: 2026-01-16

## Now
- Reduce TTUO for humans by keeping a concise, copy/paste prompt set in the root README (with a linked full catalog in docs/).

- Deconflict routing surfaces: keep Concierge as the only entrypoint; describe other capabilities as routed modules.

## Next
- Establish a lightweight AIX evidence loop:
	- Run a small probe set after context refreshes.
	- Record a dated snapshot in `docs/logs/` with outcomes + links.
- Standardize project log naming and structure across mounted repos:
	- `docs/logs/projects/<project-slug>/YYYY-MM-DD-<topic>.md`
	- Keep a short per-project README describing what’s inside.

## Not Now
- Auto-generated global inventories (a full ToC of every log file) in the workspace map.
- Heavy automation for logging/indexing until the evidence loop stabilizes and proves it saves time.
- Broad refactors inside mounted projects in the name of “cleanup” (unless explicitly approved).

## Notes
- Keep this list short (3–7 bullets per section).
- If a goal becomes stable/durable, promote it into a spec under `specs/`.

### What “good” looks like (AIX-first)

- Lower TTUO: it’s obvious where to put/find Concierge outputs.
- Lower CR: fewer ambiguous agent choices and fewer competing sources of truth.
- Higher CUS: reports consistently cite the relevant constraints, runbooks, and artifacts.
- Less drift: navigation pointers stay stable; detailed inventories live near the thing they index (or are generated).
