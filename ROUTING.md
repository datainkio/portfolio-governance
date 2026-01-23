---
aix:
	id: aix.routing.pointer
	role: Pointer to the canonical routing rules.
	status: stable
	surface: internal
	owner: AIX
	tags:
		- routing
		- concierge
		- pointer
	type: guide
	scope: aix
	audience: maintainers
	perf:
		readPriority: high
		cacheSafe: true
		critical: true
---

# Routing Canon (Pointer)

Canonical routing rules live here:
- [aix/.copilot/ROUTING.md](.copilot/ROUTING.md)

This file exists to avoid missing-route lookups in tooling that expects aix/ROUTING.md.
