# Project Backlog

This file tracks AIX and developer-experience backlog priorities.

## Now

- [ ] BUG: Reduce syntax errors from AI edits (e.g., unexpected token and malformed frontmatter failures).
- [ ] BUG: Resolve Concierge stopping mid-task when no user input is required.
- [ ] FEAT: Improve drift gate pre-commit output so commit-block messaging is concise and actionable.
- [ ] TODO: Improve terminal task output guidance (especially how to adjust `context/current-goals.md`).

## Next

- [ ] TODO: Run a benchmark-grade AIX snapshot with 2-3 probes from [docs/maintenance/aix-probe-bank.md](docs/maintenance/aix-probe-bank.md) and log results under [docs/logs/](docs/logs/).
- [ ] TODO: Extend probe bank with explicit multi-root safety probe and scope-discipline scoring notes.
- [ ] TODO: Account for terminal EOF errors and stuck heredoc modes.
- [ ] FEAT: Create explicit frontmatter schema for workspace.
- [ ] FEAT: Open permissions for running VS Code tasks without extra user input (including sensitive paths where approved).
- [ ] TODO: Update prompt triage to route to default Copilot agent when appropriate.
- [ ] TODO: Improve repo discoverability by adding lightweight index pages to key folders.

## Later / Parked

- [ ] FEAT: Add user feedback loops for multi-step agent responses and apply feedback into drift updates.
- [ ] TODO: Provide direction for keeping READMEs current and aligned with folder state.
- [ ] BUG: Handle EOF and syntax errors (e.g., unexpected end of JSON input) during file processing.
- [ ] TODO: Learn user's UX style/preferences/priorities.
- [ ] TODO: Tune agent cautiousness to reduce overlong completions and overengineered solutions.
- [ ] FEAT: Hook up ChatGPT browser instance to repos.

## Done

- [x] Integrate maintenance of constraints and decisions.
- [x] Reinforce constraint that context management should not require humans editing meta lines.
- [x] Test drift check on commit.
- [x] Add allowlisted Agent Ops tasks (safe file ops + cross-repo scripts) to reduce terminal confirmation friction.
