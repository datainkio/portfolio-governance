# TODO
The primary audience for this document is human, not AI.

## AIX / DX
- [ ] Create explicit frontmatter schema for workspace
- [ ] Reduce syntax errors from AI edits (e.g. "SyntaxError: Unexpected token '}'")
- [ ] Run a benchmark-grade AIX snapshot (fresh Copilot Chat thread) using 2–3 probes from [docs/maintenance/aix-probe-bank.md](docs/maintenance/aix-probe-bank.md) and paste the prompt + first response excerpts into a dated log under [docs/logs/](docs/logs/).
- [x] Add a lightweight Markdown link-existence checker for `docs/` (existence only; no network) and document it in a runbook.
- [ ] Extend the probe bank with an explicit multi-root safety probe (“do not touch mounted projects”) and add scoring notes for scope discipline.
- [ ] Account for terminal issues related to EOF errors and stuck heredoc modes.
- [ ] Drift gate DX: format the pre-commit failure output so the VS Code commit-block dialog shows a clean, actionable summary (1–3 lines + next steps).
- [ ] Resolve Concierge stops mid-task when no user input is needed to continue. For example: "I'm going to..." 
- [ ] Open permissions to running VS Code tasks without user input, even for sensitive files such as tasks.json.
- [ ] Improve value of terminal messages on task run:
-- "Next: open context/current-goals.md and adjust Now/Next/Not Now.": define what "adjust means"

## Future improvements for Vitaixmen
This section contains TODO items marking opportunities for improving Vitaixmen through lessons learned in this project.
- [ ] Give users the ability to provide feedback on the quality of an agent's response to a prompt requiring multiple steps. This will require identifying the appropriate times to receive user feedback (e.g. when the user determines a task is complete or when the user determines they need to interrupt a task in process), defining a structure for the feeback, and addressing the feedback. The goal is to provide continuous feedback to agents so that they can adjust their behavior and beliefs accordingly. Likely involves the step of updating drift baseline on completion.
- [ ] Provide direction for maintaining currency of README files (e.g. "always reflect the current state of the folder and the files it contains... describe goals and functions...")
- [x] Integrate maintenance of constraints and decisions 
- [x] Reinforce constraint that managing context does not require humans touching meta lines in files.
- [ ] Handle EOF and syntax errors (e.g. SyntaxError: Unexpected end of JSON input) when processing files
- [ ] Learn user's UX style/preferences/priorities
- [x] Testing drift check on commit.
- [x] Add allowlisted Agent Ops tasks (safe file ops + cross-repo scripts) to reduce terminal confirmation friction
- [ ] Figure out appropriate level of agent cautiousness; can lead to long prompt completion times and overengineered solutions; should be more open
- [ ] Update prompt triage to direct to default Copilot agent when appropriate (whatever that looks like)
- [ ] Improve repo discoverabilty and wiki/pages navigation for AI agents. Make repo docs inherently navigable by adding lightweight index files to each folder (if they don’t already exist). Each one has:
-- “what’s in this folder”
-- links to key pages
-- “start here” guidance

## Design & Development
- [ ] Hook up ChatGPT browser instance to repos