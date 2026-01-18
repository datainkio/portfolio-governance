# TODO

## AIX / DX

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
- [x] Integrate maintenance of constraints and decisions 
- [x] Reinforce constraint that managing context does not require humans touching meta lines in files.
- [ ] Handle EOF and syntax errors (e.g. SyntaxError: Unexpected end of JSON input) when processing files
- [ ] Learn user's UX style/preferences/priorities
- [x] Testing drift check on commit.
- [x] Add allowlisted Agent Ops tasks (safe file ops + cross-repo scripts) to reduce terminal confirmation friction
- [ ] Figure out appropriate level of agent cautiousness; can lead to long prompt completion times and overengineered solutions; should be more open
- [ ] Update prompt triage to direct to default Copilot agent when appropriate (whatever that looks like)

## Design & Development
- [ ] Hook up ChatGPT browser instance to repos