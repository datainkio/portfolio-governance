# Vitaixmen Migration Guide

This guide explains how to **upgrade an existing project** to newer versions of Vitaixmen **safely and intentionally**.

If you are starting a brand‑new project, see `docs/getting-started.md` instead.

---

## What “migration” means in this workspace

Migration does **not** mean automatic syncing.

It means:
- comparing your project to the latest scaffold
- understanding what has changed
- selectively applying improvements that help
- preserving all project‑specific work

The goal is better DX / AIX over time **without breaking anything**.

---

## The Migrator module

Workspace migrations are handled by the **Migrator** module (`migrator.updater`) routed through Concierge.

Its responsibilities are intentionally narrow:
- audit differences between your project and the scaffold
- classify changes by risk
- apply only low‑risk updates when explicitly approved
- document everything it changes

It will **never** refactor application code or silently overwrite your work.

---

## What the Migrator can update automatically

These areas are considered **scaffold‑managed** and are safe to update automatically:

- `.vscode/`
  - editor settings (merged, never destructive)
  - extension recommendations
- `.github/`
  - agent prompt files
  - issue / PR templates (additive)
- Documentation templates
  - `context/`, `specs/`, `docs/` (new files or managed blocks only)
- Workspace hygiene files
  - `.gitignore`, `.editorconfig`, `.gitattributes`
- Scaffold metadata
  - `.vitaixmen.json`

All updates are additive or merged conservatively.

---

## What always requires review

The Migrator will **never** auto‑apply these without explicit confirmation:

- renaming or moving files
- rewriting README content
- changing CI / workflow behavior
- updating scripts that affect developer workflow

Instead, it will generate:
- a checklist
- step‑by‑step instructions
- or a proposed patch plan

You stay in control.

---

## What is out of scope

Unless you explicitly ask, the Migrator will not touch:

- application code (`frontend/`, `backend/`, `src/`, etc.)
- dependencies used by your product
- build, deploy, or hosting configuration
- content authored for a specific client or project

---

## Recommended migration workflow

### 1. Run an audit (default)

Ask the Migrator to audit your project:

> “Compare this project to the latest vitaixmen and show me what changed.”

You’ll receive:
- a migration report
- a summary of differences
- a checklist grouped by risk

No files are changed at this stage.

---

### 2. Review the migration report

Look for:
- **Safe updates** you want applied
- **Review‑required items** you may want to handle manually
- Anything clearly irrelevant to your project (can be skipped)

---

### 3. Apply safe updates (optional)

When ready, ask:

> “Apply the safe scaffold updates and write a changelog.”

The Migrator will:
- apply only low‑risk updates
- write a changelog to `docs/changes/`
- update `.vitaixmen.json`

---

## Migration artifacts

Every migration produces documentation, typically:

- `docs/changes/workspace-migration-YYYY-MM-DD.md`
- an updated `.vitaixmen.json` history entry

These make migrations:
- reviewable
- reversible
- understandable months later

---

## Rules to remember

- ❌ No automatic syncing
- ❌ No silent overwrites
- ❌ No application code changes
- ✅ Audit first
- ✅ Apply intentionally
- ✅ Review the changelog

---

## Mental model

> **Migration is renovation, not replacement.**
>
> Keep what works.
> Improve what helps.
> Leave the rest alone.

