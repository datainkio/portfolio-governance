# AIX Probe Bank (Task Set)

Use this file to run a consistent, repeatable set of prompts to measure Agent Experience (AIX) over time.

This probe bank is designed for vitaixmen:
- Concierge is the only user-facing agent.
- Specialists are prompt modules under `.copilot/prompts/`.
- Evidence should be captured in `docs/logs/`.

See AIX definitions and targets in [specs/performance/aix.md](../../specs/performance/aix.md).

---

## How to run

- Run these prompts in order (or pick the subset you care about), starting a fresh Copilot Chat thread.
- For each prompt, capture:
  - the prompt text
  - the agent’s first response
  - whether the first response was correct (FRA)
  - number of clarifying questions (CR)
  - any hallucinations (HF)
  - turns until useful output (TTUO)
  - context utilization (CUS 0–2)
- Log results as a dated report in `docs/logs/`.

**Important:** Some prompts are read-only; a few intentionally request file edits to exercise the implementer path. If you prefer a read-only run, skip the “mutation” prompts.

---

## Scoring quick rules (consistent with AIX spec)

- **FRA (first-response accuracy):** First response is usable and correct without major missing pieces.
- **CR (clarification rate):** Count only questions that block progress (not optional “nice-to-haves”).
- **HF (hallucination frequency):** Count invented files, commands, capabilities, or claims inconsistent with the repo.
- **TTUO (time-to-useful-output):** Number of turns until you have something actionable.
- **CUS (0–2):**
  - 0 = generic advice; doesn’t use repo context
  - 1 = references repo structure/files loosely
  - 2 = cites correct files/paths and uses authoritative context (`context/`, `specs/`, `docs/`)

---

## Probe set

Each prompt includes an expected primary module. Success means the response matches the Concierge schema (Classification / Deliverable / Assumptions / Next actions) and adheres to the expected module’s output style.

### P1 — Hygiene drift (simple)
**Prompt:**
> My repo has build artifacts and editor files creeping into commits. Please fix the ignores and remove any already-tracked junk from git.

**Expected module:** `housekeeper`

**Pass criteria:**
- Proposes/implements safe `.gitignore` updates aligned with repo conventions.
- Checks for already-tracked artifacts and uses `git rm --cached` only when needed.
- Avoids deleting non-ignored files.

---

### P2 — Docs navigation (simple)
**Prompt:**
> I don’t know where to put onboarding docs so new contributors can find them easily. Recommend the best location and what to link from where.

**Expected module:** `librarian`

**Pass criteria:**
- Points to `docs/onboarding/README.md` as the home (if that’s the repo convention).
- Mentions `docs/README.md` and root README as entrypoints.

---

### P3 — “Where should X live?” (simple)
**Prompt:**
> Where should auth-related config live in this repo?

**Expected module:** `navigator`

**Pass criteria:**
- Clearly distinguishes: runtime config vs docs/specs vs secrets.
- Uses repo structure (e.g., `context/`, `specs/`, `.env.example`) instead of invented folders.

---

### P4 — Architecture decision (complex)
**Prompt:**
> I want to reorganize this workspace so agents, prompts, and docs are easier to reason about. What’s the best approach with minimal churn?

**Expected module:** `architect`

**Pass criteria:**
- Recommends an approach consistent with the scaffold’s “Concierge + modules” model.
- Avoids unnecessary file moves; prioritizes indexes/entrypoints.

---

### P5 — Planning (simple)
**Prompt:**
> I need to migrate old agent manifests into prompt modules. What are the steps, and what should be verified after each step?

**Expected module:** `planner`

**Pass criteria:**
- Produces a small, verifiable sequence with checkpoints.
- Separates routing logic (Concierge) from module behavior.

---

### P6 — Build/test triage (complex)
**Prompt:**
> The build is failing with a missing dependency error. Here’s the error log: (paste). Diagnose and propose the smallest fix.

**Expected module:** `mechanic`

**Pass criteria:**
- Starts by extracting the missing symbol/module and the failing command.
- Proposes a minimal patch (dependency add / import fix) and verification command.

---

### P7 — Editing quality (simple)
**Prompt:**
> This README is confusing and repetitive. Rewrite it to be clearer, keeping the key constraints.

**Expected module:** `editor`

**Pass criteria:**
- Produces an edited draft (not an outline).
- Preserves key constraints (template usage, Concierge system).

---

### P8 — AIX evaluation (complex)
**Prompt:**
> How do we know whether this modularization actually improved AIX?

**Expected module:** `analyst`

**Pass criteria:**
- Uses the AIX scorecard (FRA/CR/HF/TTUO/CUS) from specs.
- Provides a concrete measurement plan and logging guidance.

---

### P9 — Concierge discipline check (simple)
**Prompt:**
> Which module should handle fixing a failing test, and why?

**Expected behavior:**
- Names `mechanic` directly.
- Does not suggest “switching agents.”

---

## Optional mutation prompts (exercise Implementer)

These are meant to test end-to-end changes (edit files + verify). Skip these if you want a read-only benchmark.

### M1 — Small implementation (simple)
**Prompt:**
> Add a short link in the docs hub to the Agent Index, and make sure the link is correct.

**Expected module:** `implementer`

**Pass criteria:**
- Edits `docs/README.md` (or the appropriate hub) with a correct relative link.
- Verifies no broken links are introduced.

---

### M2 — Hygiene alignment (simple)
**Prompt:**
> Align `.gitignore` and `.vscode` excludes for `.obsidian/` so editor state doesn’t creep into commits.

**Expected module:** `implementer` (or `housekeeper` if treated as pure hygiene)

**Pass criteria:**
- Makes a minimal change consistent with ADR/log guidance.
- Avoids over-ignoring legitimate tracked files.

---

## Scoring worksheet (copy/paste)

| ID | Expected module | FRA (Y/N) | Clarifications (#) | Hallucinations (#) | TTUO (turns) | CUS (0–2) | Notes |
|---:|---|:---:|---:|---:|---:|---:|---|
| P1 | housekeeper |  |  |  |  |  |  |
| P2 | librarian |  |  |  |  |  |  |
| P3 | navigator |  |  |  |  |  |  |
| P4 | architect |  |  |  |  |  |  |
| P5 | planner |  |  |  |  |  |  |
| P6 | mechanic |  |  |  |  |  |  |
| P7 | editor |  |  |  |  |  |  |
| P8 | analyst |  |  |  |  |  |  |
| P9 | mechanic |  |  |  |  |  |  |
| M1 | implementer |  |  |  |  |  |  |
| M2 | implementer/housekeeper |  |  |  |  |  |  |
