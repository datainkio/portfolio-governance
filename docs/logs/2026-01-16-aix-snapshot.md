# AIX Snapshot – 2026-01-16

## Summary
Manual AIX snapshot after recent context/hygiene maintenance. Focus: reduce multi-root confusion and lower TTUO via stable navigation pointers (workspace map → logs → per-project logs) and clearer “Concierge is the entrypoint” language.

## Drift Sweep (what was checked)
- Entrypoints and routing surfaces:
  - `copilot-agents.json` (ensure only Concierge is registered)
  - `.copilot/prompts/*` headers and output paths (avoid “agent” naming drift)
- Navigation pointers:
  - `.copilot/context/workspace-map.md`
  - `docs/logs/README.md` and `docs/logs/projects/`
- Runbooks referencing scripts/tasks:
  - `docs/runbooks/*.md`

## Actions Taken
- Standardized migration artifact location by creating `docs/changes/` and documenting what belongs there: [../changes/README.md](../changes/README.md)
- Reduced naming drift in Migrator module prompt and removed hard-coded date in output path: [../../.copilot/prompts/migrator.updater.prompt.md](../../.copilot/prompts/migrator.updater.prompt.md)

## Probe Notes (lightweight)
This snapshot uses a small subset of the probe bank definitions as a desk check (no fresh Copilot transcript captured):

| ID | Prompt intent | Evidence in workspace | FRA | Clarifications | Hallucinations | TTUO | CUS | Notes |
|---:|---|---|:---:|---:|---:|---:|---:|---|
| P2 | Docs navigation | `docs/onboarding/`, `docs/README.md`, logs index chain | Y | 0 | 0 | ≤2 | 2 | Navigation pointers are explicit and linkable |
| P9 | Concierge discipline | `copilot-agents.json` shows only Concierge | Y | 0 | 0 | ≤1 | 2 | Low wrong-agent risk |
| M2 | Excludes alignment | `.gitignore` + `.vscode/settings.json` excludes present | Y | 0 | 0 | ≤2 | 2 | Explorer noise reduced via `files.exclude` |

## Metrics Snapshot
- FRA: 100% (3/3 probes pass as desk check)
- CR: 0% (0 blocking clarifications / 3 interactions)
- HF: 0% (0 invented files/commands cited)
- TTUO: within targets (simple ≤2 turns)
- CUS: 2 (uses canonical paths and correct file targets)

## Recommendations / Follow-ups
- For a fully comparable snapshot, run the probe bank in a fresh Copilot Chat thread and paste the prompt + first response excerpts into the next dated log.
- Consider adding a scripted broken-link check (markdown link target existence) to reduce HF drivers over time.
