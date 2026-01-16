# Project Context

## Purpose of This Document

This file provides **foundational, durable context** about the project for AI agents operating inside this workspace (e.g., GitHub Copilot, custom agents, reviewers, linters).

It answers:

* *What kind of project is this?*
* *What matters most here?*
* *What constraints should I never violate?*
* *How should I behave when making decisions or suggestions?*

This file is **not** a task list, implementation guide, or spec.
Those belong elsewhere.

---

## Project Summary
This project positions agents primarily as maintainers of workspace hygiene (e.g., organization, cleanliness, documentation consistency) and AIX performance (e.g., optimizing for AI usability, context relevance, and efficiency).

**Project Type:**
Digital experience / web project (UX + frontend + optional backend)

**Primary Goals:**

* Deliver a high-quality developer experience (DX)
* Ensure strong agent experience (AIX) through clean structure, naming, and documentation
* Produce maintainable, accessible, and performant digital experiences

**Secondary Goals:**

* Enable fast onboarding (human + AI)
* Minimize ambiguity and duplicated logic
* Favor composability and clarity over cleverness

---

## Guiding Principles

AI agents should consistently optimize for the following:

1. **Clarity over Cleverness**
   Prefer explicit, readable solutions. Avoid “smart” abstractions that obscure intent.

2. **Consistency Beats Perfection**
   Follow established patterns in this workspace even if alternatives exist.

3. **Structure Is a Feature**
   Folder structure, naming conventions, and documentation are treated as first-class UX.

4. **Accessibility Is Non-Negotiable**
   Semantic HTML, ARIA only when needed, keyboard support, and reduced-motion respect are defaults.

5. **Performance Is Intentional**
   Avoid unnecessary JavaScript, heavy dependencies, or unmeasured animation costs.

---

## Expected Tech Stack (Typical)

> This may vary per project, but agents should assume the following *unless specs say otherwise*.

* **Frontend**

  * Eleventy (11ty)
  * Nunjucks
  * Tailwind CSS
  * GSAP (motion only where meaningful)

* **Backend / CMS (if present)**

  * Sanity or comparable headless CMS

* **Tooling**

  * VS Code
  * GitHub Copilot (primary AI collaborator)
  * GitHub Actions (if CI is present)

---

## What This Workspace Optimizes For

### For Humans

* Predictable file locations
* Clear separation of concerns
* Low cognitive overhead when switching projects

### For AI Agents

* Stable reference points (`/context`, `/specs`, `/docs`)
* Minimal guesswork about intent
* Fewer hallucinated assumptions
* Faster, more accurate completions

Agents should **prefer reading context over inferring intent**.

---

## Folder Semantics (High Level)

* `/context`
  Durable truths about the project, audience, constraints, and values
  → *“Why this exists and how to think about it”*

* `/specs`
  Authoritative requirements, rules, contracts, and constraints
  → *“What must be true”*

* `/docs`
  Explanations, guides, rationale, onboarding material
  → *“How things work and why decisions were made”*

If information belongs in more than one place, **it probably belongs in `/context` or `/specs`, not `/docs`.**

---

## Decision-Making Guidance for AI Agents

When uncertain, agents should default to:

1. Check `/context` for intent and values
2. Check `/specs` for hard constraints
3. Check `/docs` for explanation or precedent
4. Mirror existing patterns in the codebase
5. Ask for clarification **only if ambiguity affects correctness**

Avoid:

* Introducing new tools, libraries, or patterns without explicit instruction
* Refactoring beyond the scope of the request
* Generating files that duplicate existing responsibilities

---

## What This File Is *Not*

* ❌ A roadmap
* ❌ A backlog
* ❌ A coding standard reference
* ❌ A how-to guide

Those belong elsewhere.

---

## Change Policy

This file should change **rarely**.

Update it only when:

* The fundamental nature of the project changes
* Core principles or constraints shift
* The intended audience or domain meaningfully changes

If a change is tactical, temporary, or implementation-specific, it does **not** belong here.