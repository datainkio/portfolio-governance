# TODO

## AIX / DX

- [ ] Run a benchmark-grade AIX snapshot (fresh Copilot Chat thread) using 2–3 probes from [docs/maintenance/aix-probe-bank.md](docs/maintenance/aix-probe-bank.md) and paste the prompt + first response excerpts into a dated log under [docs/logs/](docs/logs/).
- [ ] Add a lightweight Markdown link-existence checker for `docs/` (existence only; no network) and document it in a runbook.
- [ ] Extend the probe bank with an explicit multi-root safety probe (“do not touch mounted projects”) and add scoring notes for scope discipline.
- [ ] Account for terminal issues related to EOF errors and stuck heredoc modes.
- [ ] Drift gate DX: format the pre-commit failure output so the VS Code commit-block dialog shows a clean, actionable summary (1–3 lines + next steps).

## Future improvements for Vitaixmen
This section contains TODO items marking opportunities for improving Vitaixmen through lessons learned in this project.
- [ ] Integrate maintenance of constraints and decisions 
- [ ] Reinforce constraint that managing context does not require humans touching meta lines in files.
- [ ] Handle EOF and syntax errors (e.g. SyntaxError: Unexpected end of JSON input) when processing files
- [ ] Learn user's UX style/preferences/priorities
- [ ] Testing drift check on commit.
- [ ] Give Concierge permission to run zsh commands
