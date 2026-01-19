# AIX Animation Specs

This package defines the **animation system contract** for this workspace, optimized for:
- Rapid iteration (DX)
- Deterministic AI agent behavior (AIX)
- Generous accessibility by default

These files are intended to live under:

/aix/specs/animation/

and to be referenced by Concierge, Choreographer, and Implementer modules.

---

## Contents

### 1. motion.tokens.js
**Single source of truth for motion primitives**

Defines shared semantic tokens used by **both GSAP and Tailwind**:
- Durations
- Easings
- Distances
- Stagger values

All animation implementations should reference these tokens rather than hard-coded values.

This enables global retuning of motion feel without touching specs or scenes.

---

### 2. tailwind.motion.config.cjs
**Tailwind integration for motion tokens**

Maps motion tokens into Tailwind utilities:
- transition durations
- timing functions
- optional spacing aliases for motion distances

Ensures Tailwind micro-interactions and GSAP choreography feel coherent.

---

### 3. motion-accessibility-policy.md
**Accessibility-first motion contract**

Defines:
- Hard rules for reduced motion
- Pattern types (ui / reveal / narrative)
- Accessibility priority (essential / decorative)
- Default reduced-motion strategies

All animation specs and implementations must conform to this policy.

---

## How Agents Should Use This

### Concierge
- Routes animation-related requests to the Choreographer module.
- Ensures the user intent is animation/choreography-related.

### Choreographer
- Chooses GSAP vs Tailwind using the decision rubric.
- References motion tokens and accessibility policy.
- Emits an implementation plan with reduced-motion behavior.

### Implementer
- Produces code that strictly follows:
  - motion tokens
  - accessibility policy
  - lifecycle requirements (init / kill for GSAP)

---

## Design Principles

- Motion must never be required to understand content or state.
- Reduced motion disables or simplifies all non-essential animation.
- GSAP is preferred for choreography and iteration.
- Tailwind is preferred for simple, state-based transitions.
- All motion must be explainable, auditable, and removable.

---

## Versioning

Treat these specs as versioned contracts.
Breaking changes to tokens or accessibility rules should bump a major version.

---

## Status

This is a **foundational spec**.
Extend it by adding:
- concrete animation specs
- example patterns
- QA tasks or checklists
