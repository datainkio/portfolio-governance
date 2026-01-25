# Task Management Conventions (Taskmaster)

This doc describes how Taskmaster embeds and maintains TODO items in the repo.

## Why embed TODOs in files?
- Tasks stay close to the code/docs they affect.
- They survive chat sessions.
- They work with TODO Tree / ripgrep / IDE search.

## Prefix taxonomy
Use the following meanings:
| Prefix   | Meaning                         |
| -------- | ------------------------------- |
| TODO     | New or pending work             |
| BUG      | Incorrect behavior              |
| CHORE    | Cleanup / maintenance           |
| DOCS     | Documentation                   |
| TEST     | Tests                           |
| PERF     | Performance                     |
| A11Y     | Accessibility                   |
| SEC      | Security                        |
| REFACTOR | Restructure w/o behavior change |

Prefer:
- `BUG(BUILD): …` over `TODO: build issue …`
- `DOCS(README): …` over `TODO: docs …`

## Placement
- Put TODOs near the code, function, or section they reference.
- For cross-cutting work, prefer adding TODOs to the most relevant top-level doc (README, ARCHITECTURE.md, etc.).
- If no good home exists, consider `TASKS.md` (optional).
 - The TODO must live next to the thing it refers to.

## 1:1 Task ↔ TODO
- Each task maps to exactly one file-embedded TODO anchor.
- Track substeps in chat or the task spec, not as additional TODOs.

## Task completion
- Determine completion by checking the Definition of Done.
- Verify DoD is satisfied before closing a task.
 - Do not close a task until DoD verification is explicit.

## Formatting rules (must avoid)
- Multiline TODOs
- Emojis in TODOs
- Markdown checkboxes as tasks
- Natural-language prefixes (use the taxonomy)
- Chat-only task tracking
- Tool-specific syntax (e.g., @todo, FIXME!!!)

## Canonical grammar
- `<PREFIX>(<SCOPE>): <imperative description> [optional metadata]`
- Scope should be a short, stable noun (not a sentence).
- Metadata must be appended in square brackets (never inline).

## Native comment syntax (required)
Use native comment syntax only; no universal wrapper.
| File type      | Format                             |
| -------------- | ---------------------------------- |
| JS / TS / CSS  | `// TODO(...)`                     |
| Python / Shell | `# TODO(...)`                      |
| HTML           | `<!-- TODO(...) -->`               |
| Markdown       | `<!-- TODO(...) -->` *(preferred)* |
| YAML / TOML    | `# TODO(...)`                      |

## Metadata
Only add metadata when it helps actionability:
- `[owner=@datainkio]`
- `[due=YYYY-MM-DD]`
- `[refs=#123]`

## TODO Lifecycle (Taskmaster)
Taskmaster treats TODO items as short-lived, file-embedded signals, not long-term backlog artifacts. Lifecycle state must be immediately readable in plain text, without parsing or external tooling.

### Core principle
State is expressed primarily through the TODO marker and inline tags; metadata is secondary.

### Lifecycle states
1) **Open (default)**
	- A TODO is open unless explicitly marked otherwise.
	- No state tag required.
	- Indicates actionable or pending work.
	- Default state for all newly created TODOs.
	- Example: `// TODO(DX): Normalize Task Snapshot output`

2) **In Progress**
	- Indicates the user is actively working on the TODO.
	- Example: `// TODO(DX): Normalize Task Snapshot output [WIP]`
	- Rules:
	  - Use [WIP] only while work is actively underway.
	  - Avoid leaving TODOs in WIP indefinitely.
	  - Prefer a single WIP TODO per Active Task when possible.

3) **Blocked**
	- Indicates work cannot proceed due to an external dependency or unresolved decision.
	- Example: `// BUG(BUILD): Frontend fails on Node 20 [BLOCKED: upstream dependency]`
	- Optional additions (only when helpful): `// BUG(BUILD): Frontend fails on Node 20 [BLOCKED: upstream dependency] [since=YYYY-MM-DD]`
	- Rules:
	  - Always include a short reason after BLOCKED.
	  - Use timestamps sparingly, only to prevent silent stagnation.

4) **Completed (terminal)**
	- Completed TODOs should not remain as TODOs.
	- Preferred outcomes:
	  - Remove the TODO entirely (default).
	  - Convert to a NOTE when future context is valuable.
		 - Example: `// NOTE(DX): Task Snapshot standardized in Taskmaster v0.2.0`
	- Anti-pattern (avoid): `// TODO(DX): Normalize Task Snapshot output [DONE]`
	- Rationale: Git history preserves completion evidence; lingering DONE TODOs degrade signal quality.

### Metadata vs state
State must never be stored only in metadata.
| Concern            | How it should be represented |
| ------------------ | ---------------------------- |
| State (open / WIP / blocked) | Inline tags ([WIP], [BLOCKED: …]) |
| Ownership          | [owner=@datainkio]            |
| Deadlines          | [due=YYYY-MM-DD]              |
| References         | [refs=#123]                   |
| Priority / effort  | Optional metadata, never required |

### Taskmaster behavior rules
- Create TODOs in the Open state by default.
- Add [WIP] when the user begins active work.
- Add [BLOCKED: …] when progress halts due to dependency or uncertainty.
- Remove or convert TODOs upon completion.
- Never preserve TODOs solely for historical record.

## Examples
- `// TODO(DX): Add Task Snapshot header to all Taskmaster responses`
- `// CHORE(AIX): Normalize module prompt frontmatter`
- `<!-- DOCS(README): Add section on task switching -->`
