# Copilot Calibration Plan (Human-Guided, Post‑Modularization)

This document describes a **human‑led calibration pass** to ensure GitHub Copilot benefits from the completed modularization.
The goal is not to refactor prompts, but to **shape Copilot’s routing instincts** through controlled, corrective usage.

This is a *usage plan*, not an agent instruction.

---

## Objective

Confirm that Copilot (via Concierge):

- Selects the correct **primary module on the first pass**
- Avoids narration, tool-seeking, and agent-switch suggestions
- Produces outputs that match each module’s **Primary Output type**
- Can be corrected quickly when it misroutes, without redesign

Success means:
> A human can predict which module Copilot will choose — and Copilot usually agrees.

---

## Ground Rules (Important)

During calibration:

- ❌ Do **not** change module files unless routing is consistently wrong
- ❌ Do **not** add new modules
- ❌ Do **not** explain corrections in detail
- ✅ Correct routing with short, explicit nudges only
- ✅ Treat Copilot like a junior collaborator learning boundaries

Example correction:
> “Use `housekeeper` for this instead.”

Nothing more.

---

## Calibration Method

Tip: If you want a repeatable, scoreable run (FRA/CR/HF/TTUO/CUS), use `docs/maintenance/aix-probe-bank.md`.

Run this process over **2–3 short sessions** (15–30 minutes each).

For each prompt:
1. Issue the prompt normally.
2. Observe which module Concierge selects.
3. If correct → proceed.
4. If incorrect → interrupt immediately and correct the module choice.
5. Continue working without revisiting architecture.

---

## Calibration Prompts (Designed for Routing Confirmation)

Each prompt below is intentionally **ambiguous enough** to test routing, but **clear enough** that one module should win.

### 1. Housekeeper vs Librarian
**Prompt:**
> “My repo has a bunch of build artifacts and editor files creeping into commits. Help me clean this up.”

**Expected module:** `housekeeper`  2
**Common misroute:** `librarian`    0

Correction if needed:
> “Use housekeeper for this.”

---

### 2. Planner vs Architect
**Prompt:**
> “I want to reorganize this workspace so agents, prompts, and docs are easier to reason about. What’s the best approach?”

**Expected module:** `architect`  2
**Common misroute:** `planner`    0

Correction if needed:
> “This is an architecture decision — use architect.”

---

### 3. Planner vs Implementer
**Prompt:**
> “I need to migrate these old agent manifests into prompt modules. What should the steps be?”

**Expected module:** `planner`  2
**Common misroute:** `implementer` 0

Correction if needed:
> “Just planning — use planner.”

---

### 4. Implementer vs Mechanic
**Prompt:**
> “The build is failing with a missing dependency error. Can you fix it?”

**Expected module:** `mechanic`  2
**Common misroute:** `implementer` 0

Correction if needed:
> “Diagnose first — use mechanic.”

---

### 5. Implementer (Positive Control)
**Prompt:**
> “Add a `--dry-run` flag to this CLI and update the help text.”

**Expected module:** `implementer`  2
**This confirms:** Copilot still routes to mutation when appropriate. 

---

### 6. Editor vs Librarian
**Prompt:**
> “This README is confusing and repetitive. Can you rewrite it to be clearer?”

**Expected module:** `editor`  2
**Common misroute:** `librarian` 0

Correction if needed:
> “This is editing, not doc structure — use editor.”

---

### 7. Librarian vs Navigator
**Prompt:**
> “I don’t know where to put onboarding docs so new contributors can find them easily.”

**Expected module:** `librarian`  2
**Common misroute:** `navigator`  0

Correction if needed:
> “This is docs organization — use librarian.”

---

### 8. Navigator (Positive Control)
**Prompt:**
> “Where should auth-related config live in this repo?”

**Expected module:** `navigator` 2

---

### 9. Analyst vs Planner
**Prompt:**
> “How do we know whether this modularization actually improved AIX?”

**Expected module:** `analyst`  2
**Common misroute:** `planner`  0

Correction if needed:
> “This is evaluation — use analyst.”

---

### 10. Concierge Discipline Check
**Prompt:**
> “Which module should handle fixing a failing test, and why?”

**Expected behavior:**  2
- Concierge answers directly
- Names `mechanic`
- Does **not** suggest switching agents

---

## What to Record (Lightweight)

You do not need metrics, but jot quick notes if helpful:

- Misroutes that repeat
- Modules that feel “too attractive”
- Prompts that consistently confuse Copilot

Only act on issues that appear **more than once**.

---

## When to Adjust Modules (and when not to)

### Adjust triggers/non-triggers **only if**:
- The same misroute happens repeatedly
- The confusion is between the same two modules

### Do **not** adjust if:
- Misroute happens once
- The prompt itself was vague
- Correction immediately fixed behavior

Calibration precedes optimization.

---

## Completion Criteria

Calibration is complete when:

- You can predict routing for most prompts
- Copilot usually selects the expected module
- Corrections are rare and minimal
- No narration or tool-seeking reappears

At that point:
> **Freeze the modules. The system is calibrated.**

---

## Final Note

This process works because Copilot learns **by correction, not explanation**.

Small, firm nudges beat architectural rewrites.

