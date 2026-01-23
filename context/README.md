---
aix:
	id: aix.context.readme
	role: Define the canonical context folder purpose and usage.
	status: stable
	surface: internal
	owner: AIX
	tags:
		- context
		- canon
		- guidance
	type: context
	scope: aix
	audience: maintainers
	perf:
		readPriority: high
		cacheSafe: true
		critical: true
---

# Project Context (Canonical)

## Audience convention

- `context/` (this folder) and `specs/` are **canonical** and should be treated as source-of-truth by both humans and AI.
- `docs/` is primarily a **human-facing hub** for onboarding, runbooks, and navigation.

This folder contains the authoritative, tool-agnostic context for this project. It answers the following questions:
* Why does this project exist?
* What phase are we in?
* What decisions have already been made?
* What should not be re-debated?

Context provides *relevance*. It gives agents resources to provide the user with:
* better assumptions
* fewer hallucinated goals
* reduced "helpful but wrong" behavior
* more aligned architectural suggestions

Good context will reduce occurrences of technically correct code that violates the project's soul.

## Target Audiences

## Defining context
Think of context as *living situational awareness* for a given project. It documents current project goals, architectural decisions, known issues, terminology, and cross-repo references that apply to the entire workspace.
Context differs from specs in two key ways:
* specs define *intent* where context defines *memory*
* specs are *prescriptive* where context is *descriptive*
* specs are relatively more *stable* and *detailed* where context is more *fluid* and *responsive*.

## The context folder
Content for the context folder typically includes:
* Project intent / north star
* Design philosophy
* Constraints (organizational, ethical, historical)
* Prior decisions & tradeoffs
* Known risks or tensions
* “What matters” notes
* Client / stakeholder mental models
* AI agent guidance (“how to think here”)

## Canonical context files

Keep these short and authoritative; link out to `/specs` and `/docs` for details.

- `project.md` — durable project purpose + principles
- `current-goals.md` — time-bound priorities
- `constraints.md` — non-negotiables + phase guardrails
- `decisions.md` — accepted decision index (summaries), with ADRs in `/docs/decisions/`

## Examples and project context

- Example context: [context/example-context.md](example-context.md)
- Project context packs: [context/projects/README.md](projects/README.md)
	- Portfolio frontend: [context/projects/portfolio-frontend.md](projects/portfolio-frontend.md)

## Authority
All humans and AI agents should treat the contents of this folder as the source of truth. Other context layers may summarize or reference these files, but must not
contradict them.

## Update this folder when:
- goals change
- architectural decisions are made or reversed
- persistent issues or constraints are identified
