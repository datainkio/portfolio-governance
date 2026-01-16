# ADR 0001: Vitaixmen for AI Performance

- **Status:** accepted
- **Date:** 2026-01-13
- **Owners:** DX Team

## Context
AI agents (AIX) perform best when context, specs, and ops docs are predictable and low-noise. We need vitaixmen to make it easy for developers to find truthy sources while keeping indexing light.

## Decision
- Use a single-root workspace with canonical folders: `/context` (truth), `/specs` (contracts), `/docs/decisions` (ADRs), `/docs/runbooks` (ops), `/docs/notes` (narrative).
- Keep `.vscode/settings.json` search/watcher excludes aligned with `.gitignore` to avoid noisy indexing (`node_modules`, build outputs, `.obsidian`, caches).
- Provide templates for specs, ADRs, and runbooks so humans and AIX follow the same structure.

## Consequences
- Faster onboarding: one obvious place to look for truth vs history.
- Lower agent drift: AIX can prioritize `/context` and accepted ADRs before suggesting changes.
- Maintenance burden: requires periodic hygiene (refresh excludes, validate runbooks, prune stale notes).

## Alternatives Considered
- Distributed context across READMEs → rejected (too easy to drift).
- Single monolithic doc → rejected (hard to maintain, poor recall for AIX).

## Links
- Context canonical: `/context`
- Spec outlines: `/specs`
- Runbook/ADR templates: `/docs/runbooks`, `/docs/decisions`
