# Repo Template Readiness Audit (Fill-in)

> Note: This audit report is designed to be completed by an automated reviewer (or by you) **after** reviewing the repository contents.  
> If you paste the repo URL (or key files) into a tool that can read the repo, this can be filled with concrete findings.

## Summary

- Template repository enabled: [ ] Yes [ ] No
- Default branch intended for templating: __________
- “Use this template” workflow tested: [ ] Yes [ ] No

## Findings

### 1) Identity & Safety
- [ ] README is template-safe (no client-specific claims)
- [ ] No secrets committed (checked history)
- [ ] `.env.example` present (if env vars used)
- [ ] Placeholder tokens documented and searchable

### 2) Workspace / VS Code
- [ ] `.code-workspace` uses relative paths only
- [ ] `.vscode/extensions.json` (recommended extensions) present (optional)
- [ ] `.editorconfig` present (optional but recommended)

### 3) AI / Copilot (AIX)
- [ ] Custom agents live in `.github/agents/*.agent.md`
- [ ] Agents have clear descriptions and tool boundaries
- [ ] Repo-level custom instructions exist (if used)
- [ ] Context/specs are easy for agents to discover (index/readme)

### 4) Scaffold Hygiene
- [ ] `.gitignore` fits the intended stacks
- [ ] Example content is clearly marked and removable
- [ ] Build artifacts are excluded (e.g., `_site/`, `dist/`, `.next/`)

## Recommendations

1. ______________________________________________
2. ______________________________________________
3. ______________________________________________

## Next step

After applying changes, create a fresh repo via **Use this template**, clone it, open in VS Code, and ask **Concierge** once to validate (e.g., “generate a template personalization checklist”).
