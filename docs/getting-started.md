# Getting Started

This guide walks you through **starting a new project** using Vitaixmen.

If you are upgrading an existing project, see `docs/migration.md` instead.

---

## Step 1: Create a new repository from the template

This scaffold is designed to be used as a **template**, not cloned directly.

- Open the Vitaixmen repository on GitHub
- Click **“Use this template”**
- Create a new repository for your project

This gives you a clean project with its own Git history and no technical coupling to the scaffold.

---

## Step 2: Clone your new project locally

Clone the repository you just created:

```bash
git clone <your-new-project-repo-url>
```

Open the folder in VS Code.

You are now working in **your project**, not the scaffold.

---

## Step 3: Confirm the workspace initialized correctly

When you open the project in VS Code, you should see:

- `.vscode/` (editor settings and extension recommendations)
- `context/`, `specs/`, and `docs/` folders
- Agent prompt files (Housekeeper, Migrator, etc.)
- A root `README.md` explaining the workspace

If VS Code prompts you to install recommended extensions, accept them.

---

## Step 4: Check the scaffold marker file

Each project includes a small metadata file:

```
.vitaixmen.json
```

This file records:
- Which scaffold version the project was created from
- When it was created
- Which parts of the workspace are scaffold‑managed

**Do not delete this file.** It enables safe upgrades later.

---

## Step 5: Start project‑specific work

From this point on:

- Treat the project as fully independent
- Add frontend, backend, research, notes, or content as needed
- Customize documentation freely unless marked as scaffold‑managed
- Commit and push changes normally

There is **no automatic syncing** with the scaffold — by design.

---

## Step 6: Applying updates in the future

As the scaffold improves over time, you can bring updates into existing projects using Concierge (Migrator module).

Recommended workflow:
1. Ask Concierge to run Migrator in **Audit mode** to see what changed
2. Review the proposed updates
3. Apply only the safe updates you want

The Migrator will:
- Never touch application code
- Never overwrite authored documentation
- Always produce a changelog

---

## After Using This Template

- [ ] Rename the repository (and update the description)
- [ ] Confirm the default branch name and protection rules (if any)
- [ ] Update `README.md` to reflect the new project
- [ ] Update `/context/project.md` (or equivalent) with the new project’s goals, constraints, and stakeholders
- [ ] Search the repo for placeholders like `TEMPLATE`, `RENAME_ME`, `YOUR_ORG`, `YOUR_PROJECT`
- [ ] Review `.env.example` (never commit real secrets)
- [ ] Update package/app identifiers (`package.json` name, app title, bundle identifiers, etc.) as applicable
- [ ] Remove or replace example content (sample assets, demo pages, placeholder data)
- [ ] Open Copilot Chat and ask **Concierge** for a “template personalization checklist” once to verify setup

Want to make your own template from this? Take advantage of docs/audit_report_template.md to ensure you hit all the right points.

---

## Rules to remember

- ❌ Do not clone the scaffold repo to start a project
- ❌ Do not try to keep projects automatically synced
- ❌ Do not delete `.vitaixmen.json`
- ✅ Use the template to start new projects
- ✅ Use Migrator to upgrade intentionally

---

## Mental model

> **The scaffold is a starter kit.
> Projects are independent.
> Upgrades are intentional, not automatic.**

