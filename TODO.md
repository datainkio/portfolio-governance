# TODO

Last updated: 2026-01-16

## AIX / DX

- [ ] Run a benchmark-grade AIX snapshot (fresh Copilot Chat thread) using 2–3 probes from [docs/maintenance/aix-probe-bank.md](docs/maintenance/aix-probe-bank.md) and paste the prompt + first response excerpts into a dated log under [docs/logs/](docs/logs/).
- [ ] Add a lightweight Markdown link-existence checker for `docs/` (existence only; no network) and document it in a runbook.
- [ ] Extend the probe bank with an explicit multi-root safety probe (“do not touch mounted projects”) and add scoring notes for scope discipline.
- [ ] Account for terminal issues related to EOF errors and stuck heredoc modes.

## Future improvements for Vitaixmen
This section contains TODO items marking opportunities for improving Vitaixmen through lessons learned in this project.
- [ ] Integrate maintenance of constraints and decisions 
- [ ] Reinforce constraint that managing context does not require humans touching meta lines in files.
