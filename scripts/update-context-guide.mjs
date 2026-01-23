#!/usr/bin/env node
/**
 * ---
 * aix:
 *   id: aix.scripts.update-context-guide
 *   role: AIX script: scripts/update-context-guide.mjs
 *   status: stable
 *   surface: internal
 *   scope: aix
 *   runtime: node
 *   tags:
 *     - aix
 *     - scripts
 *     - update-context-guide.mjs
 * ---
 */

import { computeDriftReport, resolveBaseline, DEFAULTS } from './lib/drift.js';

function parseArgs(argv) {
	const args = {
		warnThreshold: DEFAULTS.warnThreshold,
		failThreshold: DEFAULTS.failThreshold,
		baseline: null,
		paths: [],
		json: false,
		help: false,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (token === '--warn-threshold') {
			const parsed = Number(argv[i + 1]);
			if (Number.isFinite(parsed)) args.warnThreshold = parsed;
			i += 1;
			continue;
		}
		if (token === '--fail-threshold') {
			const parsed = Number(argv[i + 1]);
			if (Number.isFinite(parsed)) args.failThreshold = parsed;
			i += 1;
			continue;
		}
		if (token === '--baseline') {
			args.baseline = argv[i + 1];
			i += 1;
			continue;
		}
		if (token === '--path') {
			const p = argv[i + 1];
			if (p) args.paths.push(p);
			i += 1;
			continue;
		}
		if (token === '--json') {
			args.json = true;
			continue;
		}
		if (token === '--help' || token === '-h') {
			args.help = true;
			continue;
		}
	}

	return args;
}

function printHelp() {
	process.stdout.write(`\
Usage:
  node scripts/update-context-guide.mjs [options]

What it does (non-destructive):
  - Computes drift vs baseline for context/specs/docs (or provided --path globs)
  - Groups drift into themes and suggests the smallest next action per theme
  - Does NOT advance the baseline or edit files

Options:
  --warn-threshold <n>  Warn when aggregate drift score >= n (default: ${DEFAULTS.warnThreshold})
  --fail-threshold <n>  Fail when aggregate drift score >= n (default: ${DEFAULTS.failThreshold})
  --baseline <hash>     Override drift baseline (default: context/drift-baseline.json or origin/main)
  --path <glob>         Limit drift calculation to paths (repeatable, default: context specs docs)
  --json                Emit JSON payload
  -h, --help            Show help
`);
}

function themeForFile(file) {
	const p = file.path.replace(/\\/g, '/');
	const isNewOrRename = file.added > 0 && file.deleted === 0;
	if (isNewOrRename) return 'new-or-renamed';
	if (p.startsWith('context/constraints')) return 'constraints';
	if (p.startsWith('context/decisions')) return 'decisions';
	if (p.startsWith('context/current-goals')) return 'goals';
	if (p.startsWith('context/')) return 'context-summary';
	if (p.startsWith('docs/decisions')) return 'adr-docs';
	if (p.startsWith('docs/')) return 'docs-links';
	if (p.startsWith('specs/')) return 'specs';
	return 'other';
}

function summarizeThemes(files) {
	const themes = new Map();
	for (const f of files) {
		const key = themeForFile(f);
		const current = themes.get(key) || { score: 0, count: 0, samples: [] };
		current.score += f.score;
		current.count += 1;
		if (current.samples.length < 3) current.samples.push(f.path);
		themes.set(key, current);
	}
	return themes;
}

function actionForTheme(key) {
	switch (key) {
		case 'new-or-renamed':
			return 'Check workspace maps/links (context/project.md, docs) for new or renamed files; run the Docs Link Check task to catch stale references.';
		case 'constraints':
			return 'Review constraints to ensure they reflect current architecture/decisions.';
		case 'decisions':
			return 'Update decisions.md and any ADR summaries so recent choices are captured.';
		case 'goals':
			return 'Refresh current-goals.md to match active work and priorities.';
		case 'context-summary':
			return 'Update context summaries (project/README) so they align with recent changes.';
		case 'adr-docs':
			return 'Sync ADR docs with the decision register; ensure links and statuses match.';
		case 'docs-links':
			return 'Run Docs Link Check and fix broken/stale references; align docs with current structure.';
		case 'specs':
			return 'Reconcile specs with the implementation or recent design changes.';
		default:
			return 'Inspect recent edits for context impact; update maps/links if structure changed.';
	}
}

function printThemes(themes, { warnThreshold, failThreshold, aggregate }) {
	const ordered = Array.from(themes.entries()).sort((a, b) => b[1].score - a[1].score);
	process.stdout.write(`Aggregate drift: ${aggregate.toFixed(2)} (warn ${warnThreshold}, fail ${failThreshold})\n`);
	if (!ordered.length) {
		process.stdout.write('No drift detected.\n');
		return;
	}
	process.stdout.write('Suggested next actions (by impact):\n');
	for (const [key, data] of ordered) {
		const action = actionForTheme(key);
		const sampleText = data.samples.length ? ` e.g., ${data.samples.join(', ')}` : '';
		process.stdout.write(`- ${action}${sampleText}\n`);
	}
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		printHelp();
		process.exit(0);
	}

	const cwd = process.cwd();
	const baseline = await resolveBaseline({ cwd, baselineArg: args.baseline });
	const includePaths = args.paths.length ? args.paths : ['context', 'specs', 'docs'];
	const report = computeDriftReport({ cwd, baselineHash: baseline.baselineHash, includePaths });
	const themes = summarizeThemes(report.files);
	const statusCode = report.aggregate >= args.failThreshold ? 2 : report.aggregate >= args.warnThreshold ? 1 : 0;

	if (args.json) {
		process.stdout.write(
			JSON.stringify(
				{
					aggregate: report.aggregate,
					warnThreshold: args.warnThreshold,
					failThreshold: args.failThreshold,
					baseline,
					themes: Array.from(themes.entries()).map(([key, data]) => ({
						key,
						score: data.score,
						count: data.count,
						samples: data.samples,
						action: actionForTheme(key),
					})),
				},
				null,
				2
			) + '\n'
		);
		process.exit(statusCode);
	}

	printThemes(themes, { warnThreshold: args.warnThreshold, failThreshold: args.failThreshold, aggregate: report.aggregate });
	process.exit(statusCode);
}

main().catch((err) => {
	process.stderr.write(`update-context-guide failed: ${err?.message || String(err)}\n`);
	process.exit(2);
});
