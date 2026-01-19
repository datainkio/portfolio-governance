# Technical & Product Specifications

This contains structured specifications that define how the system is
designed to work. Specs provide answers to:
* What are the inputs?
* What are the outputs?
* What constraints are non-negotiable?
* What does “done” mean?

Specs improve *correctness* by providing agents with valuable *constraints*:
* clear boundaries,
* deterministic outputs,
* fewer retries,
* higher compliance with edge cases,
* better test generation

Good specs will reduce occurrences of elegant solutions that don't actually meet requirements.

## Target Audiences
Humans and AI agents

## Defining specs
Specs describe contracts between systems (e.g. Sanity → 11ty), component structures, routing, animation patterns, and other implementation-critical details. Unlike context documents, specs are *prescriptive* and *testable*.

## The specs folder
A specs folder typically includes:
* Feature specs
* API contracts
* Data schemas
* Interaction specs
* Acceptance criteria
* Edge cases
* Accessibility requirements
* Performance budgets

These documents are more stable than notes and more detailed than context summaries.

Both humans and AI agents should reference them before making non-trivial changes.

## Feature Specs

- [Browser-accessible documentation](features/brower-accessible-documentation.md)

# Project Context (Canonical)

This folder contains the authoritative, tool-agnostic context for this project. It answers the following questions:
* Why does this project exist?
* What phase are we in?
* What decisions have already been made?
* What should not be re-debated?

## Target Audiences

## Defining context
Think of context as *living situational awarenes* for a given project. It documents current project goals, architectural decisions, known issues, terminology, and cross-repo references that apply to the entire workspace.
Context differs from specs in two key ways:
* specs define *intent* where context defines *memory*
* specs are *prescriptive* where context is *descriptive*

## The context folder
Content for the contex
* Project intent / north star
* Design philosophy
* Constraints (organizational, ethical, historical)
* Prior decisions & tradeoffs
* Known risks or tensions
* “What matters” notes
* Client / stakeholder mental models
* AI agent guidance (“how to think here”)

## Authority
All humans and AI agents should treat the contents of this folder as the source of truth. Other context layers may summarize or reference these files, but must not
contradict them.

## Update this folder when:
- goals change
- architectural decisions are made or reversed
- persistent issues or constraints are identified