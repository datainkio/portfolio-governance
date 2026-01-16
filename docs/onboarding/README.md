# Onboarding

Start here if you’re new to this repo.

## What this repo is

This repo is **Vitaixmen**: a VS Code workspace starter with repo hygiene, documentation patterns, and Copilot/agent setup.

- Product code typically lives in **separate repos/folders** that you add to the workspace.
- Canonical “truth” about constraints and decisions lives in `context/` and `docs/decisions/`.

## Quick start (10 minutes)

1. Open the workspace (`vitaixmen.code-workspace`).
2. Skim the repo map in the root README.
3. If you’re working on a project repo, add it via **File → Add Folder to Workspace…**
4. For operational procedures, use `docs/runbooks/`.

## Where to find things

- High-level overview: root `README.md`
- Documentation hub: `docs/README.md`
- Decisions (ADRs): `docs/decisions/`
- Runbooks (how-tos): `docs/runbooks/`
- Notes/logs (non-authoritative): `docs/notes/`, `docs/logs/`
- Copilot/agent system:
  - Copilot prompts/routing: `.copilot/`
  - Agent roles/workflows: `.agent/`

## Conventions

- Prefer links over duplication (don’t copy prompt text into multiple places).
- Put “how to operate” steps in runbooks; put “why we chose this” in decisions.
- Keep build artifacts/editor state out of Git (see `.gitignore`).

## First contributions

- If you’re adding docs: put durable guidance in `docs/` and reference `context/` and `specs/`.
- If you’re changing agent behavior: update `.copilot/` and keep `docs/` as human-facing navigation.
