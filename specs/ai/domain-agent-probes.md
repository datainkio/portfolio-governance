# Probe Bank: Portfolio Frontend Domain Agent

- **Title:** Probe Bank — Portfolio Frontend Domain Module
- **Owner(s):** Russell
- **Status:** draft
- **Last reviewed:** 2026-01-16
- **Related:** `specs/performance/aix.md`, `specs/ai/domain-specialized-coding-agent.md`

## Purpose
Provide a small, repeatable set of tasks to evaluate whether the Portfolio Frontend domain module improves AIX metrics (FRA/CR/HF/CUS/TTUO) compared to baseline.

## How to Run (lightweight)
For each probe:
- Run once from a fresh context (avoid leading hints).
- Record first response outcome (for FRA) and any clarifications (for CR).
- Record hallucinations (HF) when the agent cites non-existent paths/APIs/sections.
- Note which authority sources were used (CUS).

Suggested logging location:
- `aix/docs/logs/YYYY-MM-DD-agent-performance-evaluation.md` (or project-specific log if you’re using that convention)

## Probe Set (MVP)
### Probe 1 — Nunjucks macro component (atoms/molecules)
**Prompt:**
Add a new reusable Nunjucks macro component in the portfolio frontend and show me how to import and use it on a page.

**Pass criteria:**
- Chooses `frontend/njk/_includes/` and uses a macro-based pattern.
- Does not invent file locations; confirms structure via search.
- Minimal changes; no generated output edits.

**AIX focus:** FRA, HF, TTUO

---

### Probe 2 — GSAP section controller edit
**Prompt:**
Update an existing GSAP section controller to emit an AnimationBus event when its intro completes, without breaking Director initialization.

**Pass criteria:**
- Uses existing choreography architecture (Director → sections → triggers/animations).
- Uses AnimationBus for cross-section coordination.
- Respects reduced-motion handling patterns.

**AIX focus:** FRA, HF, CUS

---

### Probe 3 — 11ty collection or filter
**Prompt:**
Add an Eleventy filter that formats a date consistently across templates, and wire it into the 11ty config where filters live in this repo.

**Pass criteria:**
- Finds the correct `frontend/eleventy/` location and integration point.
- Does not invent config files; verifies before claiming.

**AIX focus:** FRA, HF, TTUO

---

### Probe 4 — Tailwind workflow guardrail
**Prompt:**
I need a new utility style. Implement it the right way for this Tailwind v4 setup and tell me what build command to run.

**Pass criteria:**
- Does not call Tailwind CLI directly; uses npm scripts.
- Respects `frontend/styles/main.css` import/layer conventions.
- Does not edit generated token outputs.

**AIX focus:** HF, CUS

---

### Probe 5 — Multi-root boundary check
**Prompt:**
Where should I add a new choreography planning doc: in aix or frontend? Create the doc in the correct place.

**Pass criteria:**
- Correctly applies multi-root authority boundary.
- Uses Librarian/Editor behaviors when appropriate (or recommends them) but still produces a concrete outcome.

**AIX focus:** CUS, CR

## Scoring Template (copy/paste)
- Probe ID:
- Result: correct / partial / incorrect
- Clarification asked? (Y/N)
- Hallucination? (Y/N) What?
- TTUO estimate (turns):
- CUS notes (sources used):
- Files changed:
- Notes:
