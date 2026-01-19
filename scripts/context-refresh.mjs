#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { computeDriftReport, resolveBaseline, DEFAULTS } from './lib/drift.js';

function parseArgs(argv) {
	const args = {
		warnThreshold: DEFAULTS.warnThreshold,
		failThreshold: DEFAULTS.failThreshold,
		baseline: null,
		paths: [],
		open: false,
		json: false,
		help: false,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (token === '--warn-threshold') {
			const raw = argv[i + 1];
			const parsed = Number(raw);
			if (Number.isFinite(parsed)) args.warnThreshold = parsed;
			i += 1;
			continue;
		}
		if (token === '--fail-threshold') {
			const raw = argv[i + 1];
			const parsed = Number(raw);
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
		// --open is deprecated; kept for compatibility but ignored to avoid auto-opening files.
		if (token === '--open') continue;
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
  node scripts/context-refresh.mjs [options]

Options:
	--warn-threshold <n>  Warn when aggregate drift score >= n (default: ${DEFAULTS.warnThreshold})
	--fail-threshold <n>  Fail when aggregate drift score >= n (default: ${DEFAULTS.failThreshold})
	--baseline <hash>     Override drift baseline (default: context/drift-baseline.json or origin/main)
	--path <glob>         Limit drift calculation to paths (repeatable, default: context specs docs)
	--open                (deprecated; ignored)
  --json               Emit JSON payload
  -h, --help           Show help
\nNotes:
	This guided workflow reports drift using the shared scoring model (git diff vs baseline, no timestamps).
	It does not rely on file timestamps or sidecar reviewedAt; recommendations are driven by drift scores.
	It does not rewrite goals/constraints/decisions content.
`);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		printHelp();
		process.exit(0);
	}

	const cwd = process.cwd();
	const baseline = await resolveBaseline({ cwd, baselineArg: args.baseline });
	const includePaths = args.paths.length > 0 ? args.paths : ['context', 'specs', 'docs'];
	const report = computeDriftReport({ cwd, baselineHash: baseline.baselineHash, includePaths });

	const recommended = report.aggregate >= args.warnThreshold;
	const sorted = [...report.files].sort((a, b) => b.score - a.score);
	const top = sorted.slice(0, 10);

	const payload = {
		ok: report.aggregate < args.warnThreshold,
		recommended,
		aggregate: report.aggregate,
		warnThreshold: args.warnThreshold,
		failThreshold: args.failThreshold,
		baseline,
		files: top,
	};

	if (args.json) {
		process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
		process.exit(report.aggregate >= args.failThreshold ? 2 : recommended ? 1 : 0);
	}

	process.stdout.write('Context Drift Report\n');
	process.stdout.write(`Aggregate drift: ${report.aggregate.toFixed(2)}\n`);
	process.stdout.write(`Recommended: ${recommended ? 'yes' : 'no'}\n`);

	if (top.length) {
		process.stdout.write('\nTop contributors:\n');
		for (const f of top) {
			process.stdout.write(`- ${f.path}\n`);
		}
	}
	process.exit(report.aggregate >= args.failThreshold ? 2 : recommended ? 1 : 0);
}

main().catch((err) => {
	process.stderr.write(`context-refresh failed: ${err?.message || String(err)}\n`);
	process.exit(2);
});
