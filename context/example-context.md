# Example Context (DX + AIX)

This example shows how a context entry can guide both humans and AI agents. Tailor it per project.

## Current Goals
- Ship the marketing site MVP with CMS-backed content and basic analytics.
- Keep build times under 90s; page LCP < 2.5s on 4G.
- Maintain parity between local, preview, and production environments.

## System Snapshot
- Frontend: 11ty + Tailwind; builds to `_site/` and deploys via static hosting.
- Backend: Sanity CMS; content delivered via GROQ API and image CDN.
- Shared services: Analytics (PostHog), email (Postmark), monitoring (Logtail).

## Key Decisions (concise ADR-style)
- Content source of truth is Sanity; no markdown fallbacks.
- All routes rendered statically; re-run full build on publish webhook.
- Component styling uses Tailwind tokens; avoid ad-hoc CSS.

## Constraints & Guardrails
- No secrets in repo; use `.env.example` for shape.
- Image assets stored in CMS; avoid committing binaries.
- Prefer static generation; avoid client-only rendering unless necessary.

## Operational Playbook (quick links)
- Install: `npm install` in `frontend/` and `backend/`.
- Dev servers: `npm run dev` in each repo (11ty + Sanity studio).
- Build: `npm run build` in `frontend/`; CMS schema deploy via `npm run deploy` in `backend/`.
- Lint/format: `npm run lint` / `npm run format` where available.

## Data Contracts
- Blog posts: `title (string)`, `slug (string)`, `publishDate (datetime)`, `body (rich text)`, `heroImage (asset ref)`, `tags (string[])`.
- Pages: `title`, `slug`, `seoDescription`, `sections (array of blocks)`, `cta (link)`.

## Release & Environments
- Branching: main → production; feature/* for WIP.
- Previews: deploy from pull requests to preview env; protect with basic auth.
- Production: auto-deploy on main after passing checks.

## Observability & Quality
- Logging: console logs captured by hosting provider; CMS webhooks logged to Logtail.
- Monitoring: uptime checks on homepage + sitemap.
- Budgets: bundle < 200KB gzipped critical path; CLS < 0.1.

## Glossary
- "AIX": AI assistants acting on this repo; follow context before generating.
- "DX": Developer experience; clarity + reliable scripts.
- "GROQ": Sanity query language for fetching content.

## Open Questions
- Do we need localization in v1?
- Should previews include passwordless links for reviewers?
