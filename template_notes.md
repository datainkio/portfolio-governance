# TEMPLATE_NOTES

This repository is intended to be used as a **GitHub template repository** (not a fork) for spinning up new projects with a consistent vitaixmen baseline and AI-friendly structure.

## What should change in a new project

- Repository name + description
- `README.md` (project-specific)
- `/context/project.md` (project-specific goals, scope, constraints, stakeholders)
- Any example content (sample pages, sample data, placeholder assets)
- Environment config:
  - Copy `.env.example` → `.env` locally (if applicable)
  - Add secrets via your secret manager / CI (never commit secrets)
- Any toolchain identifiers:
  - `package.json` name
  - application title
  - org slug / namespace references

## What should usually stay the same

- Folder structure intended for reuse (e.g., `context/`, `specs/`, `docs/`, `.github/agents/`)
- Workspace hygiene defaults (`.gitignore`, formatting defaults, editor settings)
- Agent profiles and AI instructions (update only if this new project needs a different operating model)

## Recommended first-run flow (5–10 minutes)

1. Create a new repo via **Use this template**
2. Clone it locally and open in VS Code
3. Open Copilot Chat and ask **Concierge** for a “template personalization checklist”
4. Apply the checklist it generates
5. Commit “Initial scaffold personalization” as your first commit

## Template caveats / gotchas

- Templates copy only the **default branch**.
- If you publish multiple variants, use branches/tags and point users to the right one.
- Avoid absolute paths in `.code-workspace` files; prefer relative references.

## How to contribute improvements back to the template

1. Create a branch in this template repo
2. Make changes
3. Open a PR
4. Add or update notes in `TEMPLATE_NOTES.md` if the change impacts downstream users
