# Data Spec Template

- **Title:** {{dataset/pipeline/contract}}
- **Owner(s):** {{team/people}}
- **Status:** draft
- **Last reviewed:** {{date}}
- **Scope:** {{systems/tables/feeds covered}}
- **Links:** context {{/context/...}}, ADRs {{/docs/decisions/...}}, schemas {{/specs/cms or /specs/components}}, runbooks {{/docs/runbooks/...}}

## Sources & Ingress
- Upstream systems, ingestion methods, update cadence, ownership.

## Schemas & Contracts
- Entities/fields, types, constraints, keys; sample payloads/DDL.

## Transformations & Lineage
- Steps, tools, derived fields, lineage diagram pointer.

## Storage & Access
- Storage locations, partitioning, retention, access patterns/ACLs.

## Quality & Validation
- Checks (nulls, ranges, uniqueness), SLAs/SLOs, monitoring/alerts.

## Privacy & Security
- PII handling, masking, retention, compliance requirements.

## Decisions
- Data modeling or pipeline choices with rationale.

## Open Questions
- Risks, gaps, pending approvals.
