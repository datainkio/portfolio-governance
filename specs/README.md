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

## Index

- GitHub Pages documentation site (MkDocs/Material): [specs/features/brower-accessible-documentation.md](features/brower-accessible-documentation.md)
- File-level AIX hygiene (drift-neutral additions): [specs/features/file-aix-hygiene.md](features/file-aix-hygiene.md)
- Workspace link maintenance automation: [specs/features/workspace-link-maintenance.md](features/workspace-link-maintenance.md)

### AI specs
- [specs/ai/context-drift-without-timestamps.spec.md](ai/context-drift-without-timestamps.spec.md)
- [specs/ai/documentation-steward.spec.md](ai/documentation-steward.spec.md)
- [specs/ai/ceremonial-response-spec.md](ai/ceremonial-response-spec.md)
- [specs/ai/domain-agent-probes.spec.md](ai/domain-agent-probes.spec.md)
- [specs/ai/domain-specialized-coding-agent.spec.md](ai/domain-specialized-coding-agent.spec.md)

### Animation (frontend-owned)
- [frontend/specs/animation/README.md](../../frontend/specs/animation/README.md)

### Architecture
- [specs/architecture/README.md](architecture/README.md)
- [specs/architecture/template.md](architecture/template.md)

### CMS
- [specs/cms/README.md](cms/README.md)
- [specs/cms/sanity-adoption.md](cms/sanity-adoption.md)
- [specs/cms/template.md](cms/template.md)

### Components
- [specs/components/README.md](components/README.md)
- [specs/components/template.md](components/template.md)

### Data
- [specs/data/README.md](data/README.md)
- [specs/data/template.md](data/template.md)

### Features
- [specs/features/README.md](features/README.md)
- [specs/features/adr-spec-sync.spec.md](features/adr-spec-sync.spec.md)
- [specs/features/concierge-mounted-project-aix.md](features/concierge-mounted-project-aix.md)
- [specs/features/concierge-project-aix.todo.md](features/concierge-project-aix.todo.md)
- [specs/features/js-frontmatter-schema.md](features/js-frontmatter-schema.md)
- [specs/features/template.md](features/template.md)

### Performance
- [specs/performance/README.md](performance/README.md)
- [specs/performance/template.md](performance/template.md)

### Routes & Content
- [specs/routes-content/README.md](routes-content/README.md)
- [specs/routes-content/template.md](routes-content/template.md)

### UX
- [specs/ux/README.md](ux/README.md)
- [specs/ux/accessibility.md](ux/accessibility.md)
- [specs/ux/design-system.md](ux/design-system.md)
- [specs/ux/interactions.md](ux/interactions.md)
- [specs/ux/template.md](ux/template.md)

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