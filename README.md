# Vitaixmen

A lightweight scaffold for creating **VS Code workspaces** with:
- solid repo hygiene (ignores, structure)
- better Copilot/agent ergonomics (routing, context)
- documentation patterns you can reuse

## Getting Started

This repository is **Vitaixmen**, a reusable VS Code workspace starter.

It is intended to be used as a **template** when starting a new project — not cloned and detached.

Important: Do not regenerate agent instructions (i.e. the button you get in the initial dialog for Copilot Chat). This workspace uses a custom Concierge + module routing system calibrated for AIX.

**To start a new project:**
1. Create a new repository using this repo as a **template**
2. Clone your new project locally
3. Follow the step-by-step guide in `docs/getting-started.md`

> **Important:** Do not clone this repository directly to start a project.
> Use Concierge (Migrator module) to apply scaffold updates to existing projects.

## What this repo does (and doesn’t)

- ✅ Maintains hygiene + AIX performance for the workspace
- ✅ Provides templates and doc structure for consistent project documentation
- ❌ Does not implement your product code (push that into project repos)

## Concierge prompts

Concierge is the single Copilot Chat entrypoint for this workspace. Copy/paste prompts below.

### First sitting (high TTUO)

1. “Concierge: Summarize current goals, constraints, and decisions; cite the relevant files; call out contradictions.”
2. “Concierge: Assemble a minimal context pack (3–7 sources) to work on **[task]**; flag any drift.”
3. “Concierge: Turn this into requirements + acceptance criteria: **[paste request]**.”
4. “Concierge: Draft a UX spec for **[feature]** (states, edge cases, a11y, responsive rules) + an implementation checklist.”
5. “Concierge: Propose a component inventory + variant matrix for **[page/feature]**; keep it implementable.”
6. “Concierge: Propose a Sanity content model for **[page/feature]** and map content → UI states (missing fields, defaults).”
7. “Concierge: Diagnose this error: **[paste error]**. Constraints: minimal fix + file/line links + validation steps.”
8. “Concierge: Run a quick hygiene scan (ignores/excludes/noisy outputs). Constraints: non-invasive; list fixes.”

### Regular lifecycle (high leverage)

1. “Concierge: After a context refresh, run a drift sweep and log an AIX snapshot (FRA/CR/HF/TTUO/CUS).”
2. “Concierge: Pre-PR check — hygiene + docs pointer check. Output: short, actionable fix list.”
3. “Concierge: Update current-goals if the work shifted; keep it 3–7 bullets per section.”
4. “Concierge: Draft/update an ADR for **[decision]** with options + tradeoffs; keep it short and linkable.”
5. “Concierge: Audit docs for stale commands/links and patch to match current scripts.”
6. “Concierge: Sanity change review — assess impact of **[schema/content changes]** on UI and build; propose updates.”
7. “Concierge: Scaffold upgrade — audit against latest scaffold; apply safe updates only + write changelog.”

Full menu: [docs/concierge-prompt-catalog.md](docs/concierge-prompt-catalog.md)

## Docs

- Getting started: `docs/getting-started.md`
- Docs hub: `docs/README.md`
- Concierge prompt catalog: [docs/concierge-prompt-catalog.md](docs/concierge-prompt-catalog.md)

## Tooling

This scaffold is intentionally **tool-agnostic**. Use what your project needs.

### Mermaid

Mermaid is great for lightweight diagrams in Markdown. Example prompt:

> “Review the XYZ package. Create a Mermaid diagram illustrating the initialization sequence.”

### Obsidian

The workspace includes an `.obsidian/` folder so the repo can be opened as an Obsidian vault.

- If you don’t use Obsidian, delete `.obsidian/` locally.
- If you do use Obsidian, keep notes wherever you like (committed Markdown, Obsidian Sync, iCloud, etc.).
- This repo defaults to **not tracking** `.obsidian/` in Git (to avoid editor state creep).
