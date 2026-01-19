# Feature Spec

- **Title:** GitHub Pages Documentation Site (MkDocs Material, repo-root docs)
- **Owner(s):** vitaixmen maintainers (Russell / @datainkio)
- **Status:** draft
- **Last reviewed:** 2026-01-19
- **Scope:** Workspace documentation for vitaixmen and sibling projects; GitHub Pages site generated from in-repo Markdown (repo root + `/docs` + `/specs` + `/context`)
- **Links:** context `/context/project.md`, ADRs `/docs/decisions/` (TBD), UX `/specs/ux/` (N/A), data/contracts `/specs/data/` (N/A), runbooks `/docs/runbooks/` (TBD)

## Goals & Non-Goals

### Goals
- Provide a **single, browsable documentation surface** with **sidebar navigation** and **full-text search** for humans and coding agents.
- Ensure documentation is **version-coupled to the repo**: published content corresponds to a specific commit on `main`.
- Avoid creating and manually maintaining a second “doc mirror” tree; keep Markdown in its existing locations.
- Improve **discoverability** of:
  - the workspace’s AIX hygiene goals, constraints, and rules
  - agent entrypoints and invocation patterns
  - specs and runbooks
- Make publishing **automatic** on merges/pushes to `main`, with a manual fallback trigger.

### Non-Goals
- This feature does **not** attempt to:
  - publish or render source code as documentation (beyond incidental Markdown references)
  - replace local developer docs tooling (e.g., in-IDE preview) or enforce a specific doc authoring workflow
  - create an additional curated “AI-only” doc corpus (no new `/ai-docs` requirement)
  - provide authenticated/role-based access to docs (Pages is assumed public unless repo/org policies dictate otherwise)
  - implement custom search analytics or advanced indexing (default MkDocs search is sufficient for MVP)

## User Stories & Journeys

### Primary users
- **Developer/maintainer (you):** wants a reliable, always-current docs portal to reduce ambiguity and improve agent correctness.
- **Coding agent (Copilot/ChatGPT):** needs quick access to authoritative docs to ground code/strategy recommendations.
- **Siblings in the workspace:** want consistent discovery and patterns across related repos.

### User stories
1. **As a developer**, I want docs published automatically from the repo so that I don’t maintain a second doc system.
2. **As a developer**, I want a sidebar organized by the repo’s doc structure so that I can navigate quickly.
3. **As a developer**, I want search so that I can find specs, conventions, and runbooks without browsing.
4. **As a coding agent**, I want stable URLs and a predictable navigation tree so that I can reference correct docs.
5. **As a contributor**, I want doc edits to be reviewed in PRs alongside code changes so that docs stay accurate.
6. **As a maintainer**, I want publishing to fail loudly when docs contain broken links or invalid structure.

### Journeys
- **J1: Find how to invoke agents**
  - Open Pages site → “Docs” → “Agents” → copy invocation examples.
- **J2: Understand workspace constraints**
  - Open Pages site → “Context” → “Project” → review goals/constraints.
- **J3: Look up an implementation detail**
  - Use search for a keyword (e.g., “Concierge”, “AIX”, “motion tokens”) → land on the matching spec/doc page.
- **J4: Contribute a doc update**
  - Edit Markdown in repo → open PR → CI builds docs (strict) → merge → Pages updates.

## Functional Requirements

### Publishing & hosting
- FR1: Documentation site MUST be hosted on **GitHub Pages** for the repository.
- FR2: Pages deployment MUST be performed via **GitHub Actions** (recommended source = “GitHub Actions” in Settings → Pages).
- FR3: The site MUST build and deploy on:
  - push to `main`
  - manual workflow dispatch

### Doc generation
- FR4: The site MUST be generated using **MkDocs** with **Material for MkDocs** theme.
- FR5: MkDocs MUST treat the **repo root (`.`)** as `docs_dir`, enabling direct rendering of:
  - root `README.md` (and other root Markdown docs)
  - `/docs/**.md`
  - `/specs/**.md`
  - `/context/**.md`
- FR6: The site MUST provide:
  - left sidebar navigation
  - table-of-contents behavior (per page)
  - full-text search (built-in MkDocs search plugin)
- FR7: Navigation MUST be explicitly configured (e.g., `nav:` in `mkdocs.yml`) and SHOULD mirror the repo’s documentation structure at a high level:
  - Home
  - Root README
  - Context
  - Specs
  - Docs
- FR8: A “Home” page MUST exist (`index.md`) and SHOULD include or surface the root `README.md` content (e.g., via include/snippet) to avoid duplicated content.

### Content boundaries
- FR9: Non-documentation folders and non-Markdown files SHOULD be excluded from the MkDocs content set to keep the sitemap clean and prevent accidental publishing of irrelevant artifacts.
- FR10: The build MUST run in **strict** mode so broken references fail CI (e.g., `mkdocs build --strict`).

### Link behavior
- FR11: Internal links among Markdown docs SHOULD work in the rendered site.
- FR12: If any docs use relative links that break in MkDocs/Pages, the build process MUST either:
  - adjust those links, or
  - provide authoring guidance and patterns (preferred) so contributors write links that work both in GitHub and in MkDocs.

### Security & privacy
- FR13: The feature MUST NOT publish secrets. If repository contains `.env` or other sensitive files, they MUST remain excluded and/or not referenced.
- FR14: For repos intended to remain private: publishing behavior MUST be validated against org/repo policy and GitHub plan constraints (documented as a risk until confirmed).

### Operational behavior
- FR15: CI MUST produce actionable logs on failure (missing file referenced in `nav`, Markdown syntax issues, etc.).
- FR16: CI MUST upload the built site as the Pages artifact and deploy it.

## Acceptance Criteria

### Functional acceptance
- AC1: After merge/push to `main`, the Pages site updates successfully and is reachable at the standard Pages URL for the repo.
- AC2: The site renders a Home page and a navigation sidebar with the configured structure.
- AC3: Search returns relevant results for common keywords present in docs (e.g., “Concierge”, “AIX”, “workspace”, “spec”).
- AC4: The site includes content from repo root `README.md` and at least one file from each of:
  - `/docs`
  - `/specs`
  - `/context`
- AC5: Build fails (and blocks deploy) when:
  - a page referenced in `nav` does not exist
  - a configured snippet include fails (missing path)
  - MkDocs encounters fatal Markdown parsing errors (as determined by `--strict`)

### Quality & success metrics
- AC6: Docs discoverability improves (qualitative): maintainers report reduced time to find “the right doc.”
- AC7: AIX confidence improves (qualitative): agent responses more consistently reference project goals/constraints without contradiction.
- AC8: Publishing reliability: successful deploy on ≥ 95% of `main` pushes over a rolling 30-day window (excluding intentional breakage tests).

## Dependencies & Risks

### Dependencies
- GitHub Pages enabled for the repo and configured to use GitHub Actions.
- GitHub Actions available and permitted by org policy.
- Python runtime available in Actions runner (e.g., 3.11).
- MkDocs + Material + required Markdown extensions available via pip during CI.

### Risks
- **R1: Link compatibility drift** between GitHub-rendered Markdown and MkDocs-rendered Markdown.
  - Mitigation: provide a “Linking Guidelines” section in docs; prefer absolute-from-root paths that MkDocs can resolve; validate in CI.
- **R2: Repo-root `docs_dir` increases surface area** and may accidentally include Markdown not intended for public docs.
  - Mitigation: explicit `nav` + `exclude_docs` patterns; keep “private notes” in non-published formats/paths.
- **R3: Private repo publishing constraints** (plan/org policy).
  - Mitigation: confirm desired visibility; document decision; if needed, host via internal Pages or alternative publishing method.
- **R4: Navigation maintenance** if files are renamed/moved.
  - Mitigation: keep folder-level README/index files stable; treat nav changes as part of doc PR checklist.
- **R5: Search quality limitations** of default MkDocs search for large corpora.
  - Mitigation: accept for MVP; revisit with advanced search if needed later.

## Rollout & Analytics

### Rollout plan
1. Add `mkdocs.yml`, `index.md`, and `.github/workflows/pages.yml`.
2. Configure GitHub Pages source = **GitHub Actions** in repo settings.
3. Run workflow manually once (workflow dispatch) to validate setup.
4. Merge to `main` and verify site URL.
5. Add/adjust `nav` entries to match actual doc structure.
6. Add a short “Docs Site” section to root `README.md` linking to the Pages URL.

### Feature flags
- None required (publishing is controlled by Pages settings and workflow presence).

### Analytics (lightweight)
- MVP: rely on qualitative feedback and GitHub Actions run history.
- Optional later:
  - add a simple “build stamp” (commit SHA + build time) to the site header/footer for traceability
  - enable Pages traffic insights (if available) for basic usage signal

## Decisions

- D1: Use **MkDocs Material** for navigation + search with minimal complexity and strong documentation UX.
- D2: Deploy via **GitHub Actions** to ensure site content is always version-coupled to `main`.
- D3: Set `docs_dir: .` (repo root) to avoid maintaining a duplicate doc tree.
- D4: Use explicit `nav:` to keep the published corpus bounded and predictable.
- D5: Build with `--strict` to make documentation issues fail fast (supports AIX hygiene).

## Open Questions

1. Should the Pages site be public, or should it be restricted (if the repo becomes private)?
2. What is the canonical Pages URL pattern you want advertised (org site vs repo site)?
3. Which documents are mandatory for nav at MVP (minimum set), and which are optional?
4. Do you want a build stamp (commit SHA/time) visible in the UI for traceability?
5. Do you want to enforce a doc linting step (markdownlint, link checker) beyond MkDocs strict mode?
6. Should sibling projects publish their own Pages sites, or should vitaixmen aggregate workspace docs?
