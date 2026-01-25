---
aix:
  id: aix.specs.ai.calibrator
  role: Calibrator module specification.
  status: draft
  surface: internal
  owner: AIX
  tags:
    - specs
    - ai
    - calibrator
    - alignment
  type: spec
  scope: aix
  audience: maintainers
  perf:
    readPriority: medium
    cacheSafe: true
    critical: false
---

# Calibrator Module Spec

<!-- TODO(TASKMASTER): Define the Calibrator spec. -->

## Problem
Concierge responses can drift from workspace constraints or make assumptions that conflict with `/context` and `/specs`, leading to rework and misaligned changes.

## Goal
Add a Concierge module (“Calibrator”) that performs lightweight alignment checks and returns a calibrated response that explicitly validates scope, constraints, and assumptions before execution.

## Users
- Designers/developers working in VS Code with Concierge
- Concierge modules that benefit from rapid constraint alignment (Implementer, Librarian, Housekeeper, etc.)

## Non-Goals
- A router or module selector
- A replacement for Implementer or Reviewer
- Automated file edits without an explicit implementation request
- Long-form analysis or planning

## Functional Requirements
1. **Calibration Trigger**
   - Runs when the user requests calibration or alignment checks, or when Concierge identifies high risk of constraint mismatch.
2. **Constraint Check**
   - Verifies the request against `/context` and `/specs` guidance (scope, do-not-edit areas, performance/accessibility constraints).
3. **Assumption Audit**
   - Lists explicit assumptions and asks one clarifying question if a critical assumption is missing.
4. **Scope Confirmation**
   - Confirms the target repo/path and flags potential cross-repo boundary issues.
5. **Action Safety**
   - Provides a safe next action or indicates a block if constraints conflict.

## Output Artifacts
- **Calibration Snapshot** (chat output)
  - Status: pass | warn | block
  - Constraint hits: 0–N
  - Assumptions: 0–N
  - Next action: single sentence

## Routing & Collaboration
- Calibrator is invoked as a standalone module, not a router.
- Implementer executes changes after calibration passes or warnings are acknowledged.
- Reviewer can be suggested if risk is high or changes are complex.

## State Model
- `calibration_status`: pass | warn | block
- `constraint_hits[]`: list of violated or at-risk constraints
- `assumptions[]`: explicit assumptions in the response

## Drift Heuristics (MVP)
- The request implies edits to ignored or generated paths.
- The request conflicts with a constraint or accepted ADR.
- The request spans multiple repos without explicit approval.

## Acceptance Criteria
- Calibrator clearly reports pass/warn/block in every response.
- Calibrator flags at least one conflicting constraint when present.
- Calibrator asks at most one blocking question.
- Calibrator does not proceed with implementation when status is block.

## Example Interactions
### Example 1: Warn
User: “Refactor frontend/_site output.”
Calibrator: status = block; notes generated output restriction; asks for alternate target.

### Example 2: Pass
User: “Update taskmaster spec frontmatter to AIX schema.”
Calibrator: status = pass; next action suggests Implementer.

## MVP Cut
- No automatic file edits.
- Minimal, deterministic checks using existing `/context` and `/specs`.
- No cross-repo task orchestration.
