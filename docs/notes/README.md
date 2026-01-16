# WORKSPACE NOTES
This folder is the primary location for user-authored notes. Designers and developers are its primary audiences.

## Resources & Things to Learn
- [Guide to Copilot settings](https://code.visualstudio.com/docs/copilot/reference/copilot-settings)
- [Cotnext: Make Copilot an expert for your workspace](https://code.visualstudio.com/docs/copilot/reference/workspace-context)
- [Frontmatter](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [Commmunity-contributed agents, instructions, prompts, and configs](https://github.com/github/awesome-copilot)

## TODO
TODO: Add /notes to the ignore list for AI agents
TODO: Instruct an agent to update the context folder when:
* goals change
* architectural decisions are made or reversed
* persistent issues or constraints are identified

TODO: Instruct an agent to update the specs folder when []
TODO: Instruct an agent to update .copilot/context/ to reflect changes to /context
TODO: Define success as a developer working primarily in /specs, /context, and /docs/notes while experiencing optimal agent performance.
TODO: Integrate maintenance of the docs/decisions and docs/runbooks folder. Consider instructing agents to prompt the user when relevant conditions are met.
TODO: Maintain links to related ADRs/runbooks/context for quick agent routing.

TODO: Refine Agent Roles and Workflows: Update .agent/roles/ to explicitly limit to non-coding tasks. For example, redefine "planner" as "hygiene planner" focused on organizing specs/docs. In workflows/, add hygiene-specific flows like "AIX Perf Audit" (e.g., check exclusions, benchmark VS Code startup). Remove or caveat any that imply code changes.
TODO: Enhance Hygiene Tasks: In tasks.json, add non-coding tasks like "Hygiene Scan" (runs a script to list unignored clutter) or "Doc Consistency Check" (uses simple tools to verify markdown formatting). Integrate with Obsidian for task automation, e.g., queries to flag outdated notes.
TODO: Boost AIX Perf Configurations: Add a .agent/perf-checklist.md for agents to follow, including steps to monitor AI token usage or context overload. This keeps agents focused on perf without code involvement.
TODO: Designer-Focused Integrations: Strengthen Obsidian with designer plugins (e.g., for mood boards or wireframe notes). In .copilot/prompts/, include templates like "Audit workspace for designer accessibility" (e.g., check color contrasts in docs/diagrams via simple tools, no code).
TODO: Boundary Documentation: Add a section in README.md stating: "Agents here maintain hygiene and AIX perf only—defer coding to project-specific agents." This reinforces the use case and prevents scope creep.
TODO: Monitoring and Feedback Loops: Introduce a simple .agent/hygiene-log.md template for agents to record maintenance actions. Suggest periodic AIX benchmarks (e.g., manual timing of AI queries) to ensure ongoing performance.
TODO: Monitoring and Feedback Loops: Introduce a simple .agent/hygiene-log.md template for agents to record maintenance actions. Suggest periodic AIX benchmarks (e.g., manual timing of AI queries) to ensure ongoing performance.


TODO: Add regular “context drift” checks: verify curated context files (.copilot/context, /context) align with reality; flag stale links or missing excludes.
TODO: Automate lightweight scans: broken links in docs, orphaned files, lints/format for config and docs (respect ignores), README/decision-log freshness checks.
TODO: Dependency hygiene: surface outdated tooling/config pins (formatter, linter, build tools) with safe bump suggestions.
TODO: Workspace ergonomics: ensure recommended extensions/settings/tasks are current; prune noisy configs; verify test tasks/runbooks are runnable.
TODO: Observability of AI performance: track FRA/CR/HF/TTUO snapshots and log hygiene reports regularly.


Navigator (context guide): curates and serves the minimal relevant context for tasks, keeping agents aligned with ignores/excludes.
Builder (implementation): handles code changes/features; consumes Navigator context; avoids hygiene tasks unless asked.
Reviewer (quality gate): focused on PR-style review, test coverage, and safety checks.
Librarian (docs/knowledge): maintains docs, decisions, runbooks; keeps links and indexes accurate.
Analyst (metrics/telemetry): runs AIX performance tasks, aggregates hygiene/perf trends, suggests refreshes.
