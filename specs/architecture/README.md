# Architecture Specs

This folder holds system-level specifications. It describes boundaries, flows, and operational constraints so AIX can reason about the whole system before suggesting changes.

- **Role:** Define topology, dependencies, trust boundaries, runtime/deploy model, and observability guardrails.
- **What lives here:** System context, logical views, deployment/runtime notes, resilience/observability expectations, decisions, and open questions.
- **Consumers:** AIX (for global constraints), platform/infra/DX engineers, tech leads.
- **Source links:** Anchor to accepted ADRs in `/docs/decisions/`, truth in `/context/`, and ops guidance in `/docs/runbooks/`.
