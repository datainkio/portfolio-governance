---
aix:
   id: aix.specs.ai.taskmaster
   role: Taskmaster module specification.
   status: draft
   surface: internal
   owner: AIX
   tags:
      - specs
      - ai
      - taskmaster
      - task-management
   type: spec
   scope: aix
   audience: maintainers
   perf:
      readPriority: medium
      cacheSafe: true
      critical: false
---

# Taskmaster Module Spec

## Problem
Conversations often contain multiple goals, implicit subtasks, and drift. This degrades DX by making progress hard to track, increasing rework, and making it unclear what “done” means.

## Goal
Add a Concierge module (“Taskmaster”) that manages task framing and persistence by embedding TODO items directly into project files, maintaining a single Active Task, and prompting for explicit task switches when drift occurs.

## Users
- Designers/developers working in VS Code with Concierge
- Other Concierge modules that benefit from clearer scope boundaries (Implementer, Librarian, Housekeeper, etc.)

## Non-Goals
- A full project management system
- Multi-user task assignment
- External ticketing integrations (GitHub Issues, Jira) in MVP
- Automatic code edits without routing through the appropriate implementation module

## Functional Requirements
1. **Task Detection**
   - Recognize when a conversation should be framed as a task with a beginning/middle/end.
2. **Task Creation**
   - Propose or prompt the user to name the task.
   - Require explicit approval to create/switch tasks when ambiguity exists.
3. **Single Active Task**
   - Maintain one Active Task and surface it on-demand.
4. **Task Persistence**
   - Persist tasks as file-embedded TODO items (and update them as progress is made).
   - Enforce a 1:1 relationship: each task maps to exactly one file-embedded TODO anchor.
5. **Task Snapshot**
   - Always report what task the user is working on, the phase, and the next action.
6. **Drift Detection**
   - When drift occurs, prompt to: continue, capture as TODO, or pause/switch.
7. **Prefix Taxonomy**
   - Use descriptive prefixes with the following meanings:
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
8. **File Localization**
   - Embed TODOs in the most relevant file(s), near the relevant section.
   - The TODO must live next to the thing it refers to.
9. **Task Discovery**
   - Identify TODOs in file content.
10. **Formatting Rules**
   - Avoid multiline TODOs.
   - Avoid emojis in TODOs.
   - Avoid Markdown checkboxes as tasks.
   - Avoid natural-language prefixes; use the taxonomy.
   - Avoid chat-only task tracking.
   - Avoid tool-specific syntax (e.g., @todo, FIXME!!!).
11. **Canonical Grammar**
   - Use: `<PREFIX>(<SCOPE>): <imperative description> [optional metadata]`
   - Scope should be a short, stable noun (not a sentence).
   - Metadata must be appended in square brackets (never inline).
12. **Native Comment Syntax**
   - Use native comment syntax only; no universal wrapper.
     | File type      | Format                             |
     | -------------- | ---------------------------------- |
     | JS / TS / CSS  | `// TODO(...)`                     |
     | Python / Shell | `# TODO(...)`                      |
     | HTML           | `<!-- TODO(...) -->`               |
     | Markdown       | `<!-- TODO(...) -->` *(preferred)* |
     | YAML / TOML    | `# TODO(...)`                      |
13. **Task Completion**
   - Determine when a task is complete based on its Definition of Done.
   - Verify the Definition of Done is satisfied before closing.
14. **TODO Lifecycle**
   - Treat TODO items as short-lived, file-embedded signals, not long-term backlog artifacts.
   - Lifecycle state must be immediately readable in plain text without parsing or external tooling.
   - State is expressed primarily through the TODO marker and inline tags; metadata is secondary.
   - **Open (default):** no state tag; default for newly created TODOs.
   - **In Progress:** use `[WIP]` only while work is actively underway; avoid indefinite WIP; prefer a single WIP TODO per Active Task.
   - **Blocked:** use `[BLOCKED: reason]` with a short reason; optional `[since=YYYY-MM-DD]` only when helpful; timestamps sparingly.
   - **Completed (terminal):** remove the TODO or convert to a NOTE; do not leave DONE TODOs.
   - State must never be stored only in metadata.
   - Metadata vs state:
     | Concern            | How it should be represented |
     | ------------------ | ---------------------------- |
     | State (open / WIP / blocked) | Inline tags ([WIP], [BLOCKED: …]) |
     | Ownership          | [owner=@datainkio]            |
     | Deadlines          | [due=YYYY-MM-DD]              |
     | References         | [refs=#123]                   |
     | Priority / effort  | Optional metadata, never required |

## Output Artifacts
- **Task Snapshot** (chat output)
- **TODO insertions** (file edits) via the Implementer module when actual edits are required
- Optional: a lightweight `TASKS.md` index if the project has no good place to embed cross-cutting tasks (not required for MVP)

## Routing & Collaboration
- Taskmaster decides “task framing + tracking.”
- Implementer performs file edits and returns an Implementation Report.
- Housekeeper may recommend conventions for TODO formatting and placement across repos.

## State Model
- `active_task`: { title, phase, definition_of_done[], todo_refs[] }
- `paused_tasks[]`: optional list (MVP may omit and just keep one paused title in chat)

## Drift Heuristics (MVP)
Drift is suspected when:
- user introduces a new goal that does not map to DoD bullets,
- new files/areas are introduced that are unrelated to current TODO refs,
- user asks a new “how do I…” unrelated to current task,
- the assistant is asked to “switch topics” or similar.

## Acceptance Criteria
- User can ask “what task are we on?” and get a clear answer.
- Taskmaster proposes task framing for multi-step efforts.
- Taskmaster refuses to silently change tasks.
- TODO items are formatted consistently and can be searched (e.g., TODO Tree).
- Drift prompts are clear and require an explicit choice.
- The system works across a multi-repo workspace (frontend/backend/aix) without assuming paths.
- Taskmaster identifies the correct prefix for the current use case.
- Taskmaster proposes a new task when the content of a conversation warrants it.
- Taskmaster recognizes when a conversation is related to an existing task.

## Testing & Calibration
<!-- TEST(Taskmaster): Test and calibrate Taskmaster [BLOCKED: paused by user]. -->

## Build Taskmaster
<!-- TODO(Taskmaster): Build Taskmaster module. -->

### Calibration checklist (short)
- Confirms or prompts for task initiation when no Active Task exists.
- Maintains exactly one Active Task and requires explicit switch approval.
- Emits a single, file-embedded TODO anchor per task using native comment syntax.
- Uses canonical grammar with short noun scope and bracketed metadata.
- Detects drift and offers continue/pause/capture options.
- Reports a Task Snapshot with Active Task, phase, next action, and TODO anchor location.
- Determines task completion against the Definition of Done.

## Example Interactions

### Example 1: Propose Task
User: “Let’s add a new Concierge module for task management.”
Taskmaster:
- Proposes title + DoD
- Asks approval to create TODOs in `/aix/modules/taskmaster.prompt.md` and `/aix/specs/taskmaster-spec.md`

### Example 2: Drift
User: “Also, can we fix the build failing in frontend?”
Taskmaster:
- “That’s a different task. Continue current / capture as TODO / pause and switch?”

### Example 3: Capture as TODO
User: “We should add prefix taxonomy to the README later.”
Taskmaster:
- Adds `// DOCS(README): Document TODO taxonomy…` near README section (or adds to TASKS.md)

## MVP Cut
For MVP, Taskmaster:
- does not integrate with external issue trackers,
- does not require a global tasks index,
- uses simple drift heuristics,
- focuses on consistent output and explicit task switches.
