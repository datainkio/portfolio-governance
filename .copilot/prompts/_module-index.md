# Prompt Module Index (Concierge Routing)

This index is the primary routing surface for Concierge. Each module lists a one-line purpose, top triggers, and its **Primary Output type**.
- Select **exactly 1** primary module (max 2 only if tightly coupled).
- Prefer modules with the clearest Primary Output match.

---

## concierge.prompt.md (Router Contract)
**Purpose:** Defines routing policy + mandatory response schema used by Concierge.
**Top triggers:** route, select module, routing rubric, response schema, AIX constraints
**Primary Output type:** Contract / Output Schema

---

## analyst.prompt.md
**Purpose:** Produce a crisp analysis brief that compares options and recommends a direction.
**Top triggers:** analysis, compare options, tradeoffs, pros/cons, recommendation, requirements clarification, acceptance criteria, risks & assumptions
**Primary Output type:** Analysis Brief

---

## architect.prompt.md
**Purpose:** Make architecture decisions for repo/workspace structure, agent/module strategy, and standards.
**Top triggers:** workspace architecture, repo structure, monorepo vs multi-repo, conventions, agent design
**Primary Output type:** Architecture Proposal
**File:** [aix/.copilot/prompts/architect.prompt.md](architect.prompt.md)

---

## editor.prompt.md
**Purpose:** Rewrite/edit text with consistent voice, structure, and clarity (docs, copy, narrative).
**Top triggers:** rewrite, tighten, tone, clarity, restructure, editing
**Primary Output type:** Edited Draft
**File:** [aix/.copilot/prompts/editor.prompt.md](editor.prompt.md)

---

## housekeeper.prompt.md
**Purpose:** Workspace hygiene (folders, naming, ignores, conventions, DX/AIX cleanliness).
**Top triggers:** .gitignore, ignore files/folders, vitaixmen, naming conventions, cleanup
**Primary Output type:** Workspace Hygiene Plan
**File:** [aix/.copilot/prompts/housekeeper.prompt.md](housekeeper.prompt.md)

---

## implementer.prompt.md
**Purpose:** Implement an approved change end-to-end by editing files, running checks, and reporting results.
**Top triggers:** implement, fix bug, add feature, modify code, apply plan, working patch
**Primary Output type:** Implementation Report

---

## librarian.prompt.md
**Purpose:** Documentation curation and navigation (READMEs, context packs, linking, discoverability).
**Top triggers:** README, docs structure, cross-links, documentation cleanup, context/specs
**Primary Output type:** Documentation Update Pack
**File:** [aix/.copilot/prompts/librarian.prompt.md](librarian.prompt.md)

---

## mechanic.prompt.md
**Purpose:** Diagnose and resolve build/test/tooling failures; produce minimal, testable fixes.
**Top triggers:** error log, build failure, CI failure, dependency issue, tooling problem
**Primary Output type:** Triage Report
**File:** [aix/.copilot/prompts/mechanic.prompt.md](mechanic.prompt.md)

---

## migrator.updater.prompt.md
**Purpose:** Safely migrate an existing project to newer versions of vitaixmen without disrupting project-specific work.
**Top triggers:** update vitaixmen, migrate project, sync with vitaixmen, upgrade workspace, apply latest DX/AIX conventions
**Primary Output type:** Workspace Migration Plan
**Non-goal:** Does not refactor application code or alter build/deploy behavior unless explicitly requested.

---

## Mounted frontend modules (from frontend/.copilot/prompts/index.md)
**Purpose:** Use the mounted project’s prompt modules for portfolio frontend work (11ty/Nunjucks/Tailwind v4/GSAP/Airtable/Sanity).
**Top triggers:** explicit `frontend/` scope or stack cues (eleventy/11ty, Nunjucks, Tailwind v4, GSAP, AnimationBus, Director.js, Airtable collections, choreography).
**Primary Output type:** Implementation Report (module-specific).
**Modules:** display.prompt.md (templates/Nunjucks), js.prompt.md (browser JS), choreographer.prompt.md (GSAP vs Tailwind decision), choreography-planning.prompt.md (motion plan, no code), choreography-implementation.prompt.md (GSAP/choreography code), domain.prompt.md (general frontend).

## navigator.prompt.md
**Purpose:** Help locate the right file/folder/entrypoint and define where changes should live.
**Top triggers:** where is, where should this go, file location, entry point, codebase navigation
**Primary Output type:** Context Bundle
**File:** [aix/.copilot/prompts/navigator.prompt.md](navigator.prompt.md)

---

## planner.prompt.md
**Purpose:** Convert a request into a small, verifiable execution plan (sequenced steps, checkpoints).
**Top triggers:** plan, migration steps, sequencing, rollout, checklist, verification steps
**Primary Output type:** Execution Plan

---

## reviewer.prompt.md
**Purpose:** Review a proposed change (plan/spec/diff/text) for correctness, risk, completeness, and AIX impact.
**Top triggers:** review, critique, QA, risk, completeness, improvement suggestions
**Primary Output type:** Review Report

---
