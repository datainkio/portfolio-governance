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
Conversation-first task tracking is fragile and transient. Tasks need to live in code and docs so they can be discovered, versioned, and linked to issues without relying on chat state.

## Goal
Refactor Taskmaster to treat **file-embedded TODOs** as the single source of truth for tasks and rely on the TODO-to-Issue GitHub Action to create, update, and close GitHub Issues.

## Users
- Designers/developers working in VS Code with Concierge
- Other Concierge modules that benefit from clearer scope boundaries (Implementer, Librarian, Housekeeper, etc.)

## Non-Goals
- A full project management system
- Conversation-driven task framing (Active Task, drift detection, chat-only state)
- Multi-user task assignment workflows
- Automatic code edits without routing through the appropriate implementation module

## Functional Requirements
1. **TODO Discovery**
   - Treat TODO items in files as the source of truth for tasks.
2. **TODO Creation Guidance**
   - Propose TODO insertions with correct syntax and placement near relevant code/docs.
3. **TODO Formatting**
   - Use `TODO:` with the canonical grammar and native comment syntax.
4. **TODO Options**
   - Support optional metadata lines for labels, assignees, and milestones (issue fields).
5. **GitHub Issue Integration**
   - Ensure TODOs are compatible with the TODO-to-Issue GitHub Action.
   - Issues are created/updated/closed by the action, not by chat state.
6. **Prefix Taxonomy**
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
7. **File Localization**
   - Embed TODOs in the most relevant file(s), near the relevant section.
   - The TODO must live next to the thing it refers to.
8. **Formatting Rules**
   - Avoid multiline TODOs.
   - Avoid emojis in TODOs.
   - Avoid Markdown checkboxes as tasks.
   - Avoid natural-language prefixes; use the taxonomy.
   - Avoid chat-only task tracking.
   - Avoid tool-specific syntax (e.g., @todo, FIXME!!!).
9. **Canonical Grammar**
   - Use: `<PREFIX>: <imperative description> [optional metadata]`
   - Metadata must be appended in square brackets (never inline).
10. **Native Comment Syntax**
   - Use native comment syntax only; no universal wrapper.
     | File type      | Format                             |
     | -------------- | ---------------------------------- |
     | JS / TS / CSS  | `// TODO(...)`                     |
     | Python / Shell | `# TODO(...)`                      |
     | HTML           | `<!-- TODO(...) -->`               |
     | Markdown       | `<!-- TODO(...) -->` *(preferred)* |
     | YAML / TOML    | `# TODO(...)`                      |
11. **TODO Lifecycle**
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
- **TODO insertions** (file edits) via the Implementer module when actual edits are required
- Optional: a lightweight `TASKS.md` index if the project has no good place to embed cross-cutting tasks (not required for MVP)
- GitHub Issues created/updated by the TODO-to-Issue action

## Routing & Collaboration
- Taskmaster decides TODO formatting and placement guidance.
- Implementer performs file edits and returns an Implementation Report.
- GitHub Actions handles issue creation/update/close.
- Housekeeper may recommend conventions for TODO formatting and placement across repos.

## State Model
- TODO items in files are the only persisted state.
- No Active Task or chat-only task state is maintained.

## Acceptance Criteria
- TODO items are formatted consistently and can be searched (e.g., TODO Tree).
- TODOs use `TODO:` with canonical grammar and native comment syntax.
- TODOs map cleanly to GitHub Issues via the TODO-to-Issue action.
- The system works across a multi-repo workspace (frontend/backend/aix) without assuming paths.
- Taskmaster suggests TODO insertions in relevant files instead of framing chat-based tasks.

## Testing & Calibration
<!-- TEST: Test TODO-to-Issue workflow on a sample TODO. -->

## Build Taskmaster
<!-- TODO: Refactor Taskmaster for TODO-to-Issue workflow. -->

### Calibration checklist (short)
- Uses canonical grammar with bracketed metadata.
- Places TODOs near relevant code/docs with native comment syntax.
- Confirms TODO-to-Issue action picks up new TODOs on push/workflow dispatch.
- Removes TODOs or converts to NOTE on completion (no DONE TODOs).

## Example Interactions

### Example 1: Capture TODO
User: “We should add prefix taxonomy to the README later.”
Taskmaster:
- Adds `<!-- DOCS: Add prefix taxonomy section -->` near the README section.

### Example 2: TODO Options
User: “Make this TODO assignable and label it.”
Taskmaster:
- Adds:
   - `labels: enhancement, help wanted`
   - `assignees: datainkio`

### Example 3: Complete TODO
User: “That’s done now.”
Taskmaster:
- Removes the TODO or converts it to a NOTE if context is valuable.

## MVP Cut
For MVP, Taskmaster:
- relies on the TODO-to-Issue action for issue creation,
- does not maintain conversation-based task state,
- does not require a global tasks index,
- focuses on consistent TODO formatting and placement.
