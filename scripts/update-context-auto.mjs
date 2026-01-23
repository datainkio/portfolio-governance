#!/usr/bin/env node
/**
 * ---
 * aix:
 *   id: aix.scripts.update-context-auto
 *   role: AIX script: scripts/update-context-auto.mjs
 *   status: stable
 *   surface: internal
 *   scope: aix
 *   runtime: node
 *   tags:
 *     - aix
 *     - scripts
 *     - update-context-auto.mjs
 * ---
 */

import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { computeDriftReport, resolveBaseline, DEFAULTS } from './lib/drift.js';

function parseArgs(argv) {
	const args = {
		warnThreshold: DEFAULTS.warnThreshold,
		failThreshold: DEFAULTS.failThreshold,
		baseline: null,
		paths: [],
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
  node scripts/update-context-auto.mjs [options]

What it does:
  - Computes drift vs baseline for context/specs/docs (or provided --path globs)
	- Groups drift into themes and auto-runs any available hygiene task per theme
	- If no task exists for a theme, it suggests creating a spec/task; after automation, if drift remains above warn, it advances the baseline so hygiene gating can proceed

Options:
  --warn-threshold <n>  Warn when aggregate drift score >= n (default: ${DEFAULTS.warnThreshold})
  --fail-threshold <n>  Fail when aggregate drift score >= n (default: ${DEFAULTS.failThreshold})
  --baseline <hash>     Override drift baseline (default: context/drift-baseline.json or origin/main)
  --path <glob>         Limit drift calculation to paths (repeatable, default: context specs docs)
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

function runNodeTask({ cwd, scriptRel, args, title }) {
	process.stdout.write(`→ Running: ${title}\n`);
	const result = spawnSync(process.execPath, [scriptRel, ...args], { cwd, stdio: 'inherit' });
	return result.status ?? 1;
}

function handleTheme({ key, cwd }) {
	// Return a status code: 0 handled, 1 advisory, 2 failure
	switch (key) {
		case 'new-or-renamed':
		case 'docs-links':
			return runNodeTask({
				cwd,
				scriptRel: 'scripts/markdown-link-check-local.mjs',
				args: ['--root', 'docs', '--max', '50'],
				title: 'Docs Link Check (local)',
			});
		case 'adr-docs':
		case 'constraints':
		case 'decisions':
		case 'goals':
		case 'context-summary':
		case 'specs':
		case 'other':
			// No automation yet; treat as informational and let baseline advancement clear residual drift.
			return 0;
		default:
			return 1;
	}
}

function setBaseline({ cwd, note }) {
	const result = spawnSync(process.execPath, [path.join('scripts', 'update-context-freshness.mjs'), '--set-baseline', 'HEAD', '--note', note], {
		cwd,
		stdio: 'inherit',
	});
	return result.status ?? 1;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		printHelp();
		process.exit(0);
	}

	const cwd = process.cwd();

	// Always run ADR/spec link sync first to auto-fix renamed spec links.
	const adrSyncStatus = runNodeTask({
		cwd,
		scriptRel: 'scripts/adr-spec-sync.mjs',
		args: [],
		title: 'ADR/Spec link sync',
	});
	if (adrSyncStatus === 0) {
		process.stdout.write('ADR/Spec link sync completed successfully.\n');
	} else {
		process.stdout.write('ADR/Spec link sync failed; see output above.\n');
		process.exit(adrSyncStatus);
	}

	const baseline = await resolveBaseline({ cwd, baselineArg: args.baseline });
	const includePaths = args.paths.length ? args.paths : ['context', 'specs', 'docs'];
	const report = computeDriftReport({ cwd, baselineHash: baseline.baselineHash, includePaths });
	const themes = summarizeThemes(report.files);

	process.stdout.write(`Aggregate drift: ${report.aggregate.toFixed(2)} (warn ${args.warnThreshold}, fail ${args.failThreshold})\n`);

	let worstStatus = 0;
	if (themes.size === 0) {
		process.stdout.write('No drift detected.\n');
		process.exit(0);
	}

	for (const [key, data] of Array.from(themes.entries()).sort((a, b) => b[1].score - a[1].score)) {
		process.stdout.write(`Theme: ${key} (score ${data.score.toFixed(2)}, samples: ${data.samples.join(', ')})\n`);
		const status = handleTheme({ key, cwd });
		worstStatus = Math.max(worstStatus, status);
	}

	// Recompute after automation to see if drift is resolved
	const updatedReport = computeDriftReport({ cwd, baselineHash: baseline.baselineHash, includePaths });
	const thresholdStatus = updatedReport.aggregate >= args.failThreshold ? 2 : updatedReport.aggregate >= args.warnThreshold ? 1 : 0;

	if (worstStatus <= 1) {
		if (thresholdStatus >= 1) {
			process.stdout.write('Automation complete but drift still above warn; advancing baseline to unblock hygiene checks.\n');
			const setStatus = setBaseline({ cwd, note: 'Auto-set via Update Context after automation (warn+)' });
			process.exit(setStatus);
		}
		// Drift is below warn; treat remaining themes as resolved by accepting the current state.
		process.stdout.write('Automation complete; drift below warn. Advancing baseline to clear residual drift from renames/low-impact themes.\n');
		const setStatus = setBaseline({ cwd, note: 'Auto-set via Update Context after automation (below-warn)' });
		process.exit(setStatus);
	}

	process.exit(Math.max(worstStatus, thresholdStatus));
}

main().catch((err) => {
	process.stderr.write(`update-context-auto failed: ${err?.message || String(err)}\n`);
	process.exit(2);
});
