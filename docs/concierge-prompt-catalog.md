# Concierge Prompt Catalog

This catalog is a **human-friendly menu of high-value things to ask Concierge** (the workspace’s single Copilot Chat entrypoint).
Concierge will classify your intent and route work to the right specialist module (Housekeeper, Navigator, Librarian, Mechanic, Architect, Analyst, Editor, Migrator), then return an end-to-end result.

Use this when you want:
- faster “time to useful output” (TTUO)
- fewer wrong turns in multi-root workspaces
- consistent operational artifacts (logs, runbooks, ADRs)

> If you only want the shortest set of prompts, see the two concise lists in the root README.

---

## How to write good Concierge prompts

Good prompts are **outcome-shaped** and include one or two constraints.

### Template

Copy/paste and fill in the brackets:

> “Concierge: **[goal / outcome]** for **[scope]**. Constraints: **[non-invasive? a11y? perf? no refactors?]**. Output: **[plan / patch / doc / diagram / log entry]**.”

### Examples

- “Concierge: Assemble a minimal context pack for adding a new Eleventy collection. Constraints: use canonical sources; flag drift. Output: 5–7 links + checklist.”
- “Concierge: Diagnose the build error I’m seeing (`<paste error>`). Constraints: minimal fix; don’t touch mounted projects. Output: patch + how to validate.”
- “Concierge: Propose a Sanity content model for the homepage hero + how it maps to UI states. Constraints: a11y-first; avoid over-modeling. Output: schema sketch + implementation steps.”

---

## Prompt menu (by outcome)

### 1) Orientation and context (fast onboarding)

- “Concierge: Summarize current goals, constraints, and decisions; cite the relevant files; call out contradictions.”
- “Concierge: Assemble a minimal context pack (3–7 sources) to work on **[task]**; flag any drift between docs and reality.”
- “Concierge: Map the important folders and where outputs should go (logs/runbooks/specs); keep it multi-root safe.”
- “Concierge: Turn this vague request into requirements + acceptance criteria: **[paste request]**.”

### 2) UX design + development (interfaces that ship)

- “Concierge: Draft a UX spec for **[feature]**: primary flow, edge cases, empty/error/loading states, responsive rules, and a11y checks. Output: Markdown spec.”
- “Concierge: Propose a component inventory + variant matrix for **[page/feature]**. Output: list of components + states.”
- “Concierge: Recommend an interaction/motion approach for **[UI]** with reduced-motion behavior and perf constraints. Output: guidelines + implementation hooks.”
- “Concierge: Review **[existing UI]** for usability issues and produce a prioritized fix list. Constraints: minimal churn.”

### 3) CMS integration (Sanity and dynamic backends)

- “Concierge: Propose a Sanity schema for **[content type]** that supports **[UI needs]**; include required/optional fields and editor guidance.”
- “Concierge: Map Sanity data → UI states for **[component/page]** (what happens when fields are missing?). Output: truth table.”
- “Concierge: Recommend query patterns and caching strategy for **[data]**. Constraints: keep editors fast; avoid over-fetching.”
- “Concierge: Identify risks in **[current content model]** (e.g., too much nesting, unstable references) and propose a safer shape.”

### 4) Architecture and decisions (make tradeoffs explicit)

- “Concierge: Provide 2–3 architecture options for **[problem]** with tradeoffs (perf, maintainability, a11y, cost). Output: decision summary.”
- “Concierge: Draft an ADR for **[decision]** (context, options, decision, consequences). Output: new file in docs/decisions/.”
- “Concierge: Recommend folder/module boundaries for **[new feature area]**; keep changes minimal and consistent.”

### 5) Build/CI/runtime debugging (get unblocked)

- “Concierge: Diagnose **[error output]**. Constraints: minimal fix; include exact file/line links; propose validation steps.”
- “Concierge: Audit dependencies/tooling for **[problem]** (node version mismatch, lockfile drift, missing env vars). Output: fix list.”
- “Concierge: Create a tiny runbook for reproducing and fixing **[recurring failure]**.”

### 6) Documentation and runbooks (reduce repeat work)

- “Concierge: Update README to reflect **[new workflow]**; keep it concise and link out to details.”
- “Concierge: Repair stale docs: find broken links and outdated commands; patch with the current scripts.”
- “Concierge: Write a runbook for **[task]** (pre-reqs, steps, validation, rollback).”

### 7) Hygiene + AIX maintenance (make the workspace easier to work in)

- “Concierge: Run a quick hygiene scan (ignores/excludes, noisy outputs, naming drift). Constraints: don’t touch mounted projects. Output: actionable fixes.”
- “Concierge: Reduce ambiguity in navigation pointers (workspace map → logs convention → per-project logs). Output: small doc updates.”
- “Concierge: After a context refresh, run a drift sweep and log an AIX snapshot (FRA/CR/HF/TTUO/CUS). Output: dated log entry.”

### 8) Migration and scaffold upgrades (intentional, safe updates)

- “Concierge: Audit this project against the latest scaffold and summarize safe vs review-required updates.”
- “Concierge: Apply safe scaffold updates only (agent prompts, VS Code settings, docs pointers) and write a changelog.”

---

## Output expectations (what Concierge should return)

When you ask Concierge to do work that changes artifacts, a strong result typically includes:
- **Classification** (what kind of work it is; which module pattern applies)
- **Deliverable** (patch / doc / checklist / log entry)
- **Assumptions** (short; explicit)
- **Next actions** (how you validate or proceed)

---

## Suggested cadence (AIX maintainer)

- After context refreshes: drift sweep + AIX snapshot log.
- Weekly / pre-PR: hygiene scan + docs pointer check.
- After meaningful decisions: ADR (short, linkable).

