#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { computeDriftReport, resolveBaseline, DEFAULTS } from './lib/drift.js';

const BASELINE_FILE = 'context/drift-baseline.json';

function parseArgs(argv) {
	const args = {
		setBaseline: false,
		baseline: null,
		note: null,
		warnThreshold: DEFAULTS.warnThreshold,
		failThreshold: DEFAULTS.failThreshold,
		failOnThreshold: false,
		summary: false,
		json: false,
		help: false,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (token === '--set-baseline') {
			args.setBaseline = true;
			args.baseline = argv[i + 1] || 'HEAD';
			i += 1;
			continue;
		}
		if (token === '--baseline') {
			args.baseline = argv[i + 1];
			i += 1;
			continue;
		}
		if (token === '--note') {
			args.note = argv[i + 1] || null;
			i += 1;
			continue;
		}
		if (token === '--warn-threshold') {
			const n = Number(argv[i + 1]);
			if (Number.isFinite(n)) args.warnThreshold = n;
			i += 1;
			continue;
		}
		if (token === '--fail-threshold') {
			const n = Number(argv[i + 1]);
			if (Number.isFinite(n)) args.failThreshold = n;
			i += 1;
			continue;
		}
		if (token === '--fail-on-threshold') {
			args.failOnThreshold = true;
			continue;
		}
		if (token === '--summary') {
			args.summary = true;
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
  node scripts/update-context-freshness.mjs [options]

Options:
  --set-baseline [hash]  Write context/drift-baseline.json with the given hash (default: HEAD)
  --baseline <hash>      Override baseline used for drift calculation
  --note <text>          Note to record in baseline file when setting baseline
  --warn-threshold <n>   Warn when aggregate drift score >= n (default: ${DEFAULTS.warnThreshold})
  --fail-threshold <n>   Fail when aggregate drift score >= n (default: ${DEFAULTS.failThreshold})
  --fail-on-threshold    Exit non-zero when aggregate >= warn threshold
	--summary              Print a concise one-line drift summary (aggregate and thresholds)
  --json                 Emit JSON payload
  -h, --help             Show help

Notes:
  This replaces timestamp-based freshness tracking with drift-score baselines.
`);
}

function tryExecGit(args, { cwd }) {
	try {
		return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
	} catch {
		return null;
	}
}

async function readExistingBaseline({ cwd, file }) {
	try {
		const raw = await fs.readFile(path.join(cwd, file), 'utf8');
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function writeBaselineFile({ cwd, baselineHash, note }) {
	const branch = tryExecGit(['rev-parse', '--abbrev-ref', 'HEAD'], { cwd });
	const payload = {
		baselineHash,
		branch: branch || 'unknown',
		notes: note || undefined,
	};
	const target = path.join(cwd, BASELINE_FILE);
	return fs
		.mkdir(path.dirname(target), { recursive: true })
		.then(() => fs.writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8'))
		.then(() => target);
}

function exitCode({ aggregate, warnThreshold, failThreshold, failOnThreshold }) {
	if (aggregate >= failThreshold) return 2;
	if (aggregate >= warnThreshold) return failOnThreshold ? 2 : 1;
	return 0;
}

function printHumanReport({ report, warnThreshold, failThreshold }) {
	const { aggregate, baselineHash, files } = report;
	process.stdout.write(`Baseline: ${baselineHash}\n`);
	process.stdout.write(`Aggregate drift: ${aggregate.toFixed(2)} (warn ${warnThreshold}, fail ${failThreshold})\n`);
	if (!files.length) {
		process.stdout.write('No drift detected.\n');
		return;
	}
	const sorted = [...files].sort((a, b) => b.score - a.score);
	for (const f of sorted.slice(0, 10)) {
		process.stdout.write(
			`- ${f.path}: score ${f.score.toFixed(2)} (+${f.added}/-${f.deleted}, crit ${f.criticalityWeight}, sem ${f.semanticWeight} ${f.semanticBucket})\n`
		);
	}
	process.stdout.write('\nTo accept current state as baseline: node scripts/update-context-freshness.mjs --set-baseline HEAD --note "reason"\n');
}

function printSummary({ report, warnThreshold, failThreshold }) {
	const { aggregate, files } = report;
	const top = [...files].sort((a, b) => b.score - a.score).slice(0, 3);
	const topDesc = top.map((f) => `${f.path} (${f.score.toFixed(2)})`).join(', ');
	const details = top.length ? ` | top: ${topDesc}` : '';
	process.stdout.write(`Drift summary: ${aggregate.toFixed(2)} (warn ${warnThreshold}, fail ${failThreshold})${details}\n`);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		printHelp();
		process.exit(0);
	}

	const cwd = process.cwd();

	if (args.setBaseline) {
		const resolved = await resolveBaseline({ cwd, baselineArg: args.baseline || 'HEAD' });
		const target = await writeBaselineFile({ cwd, baselineHash: resolved.baselineHash, note: args.note });
		process.stdout.write(`Baseline set successfully -> ${target}\n`);
		if (args.note) process.stdout.write(`Note: ${args.note}\n`);
		process.exit(0);
	}

	const baseline = await resolveBaseline({ cwd, baselineArg: args.baseline });
	const report = computeDriftReport({ cwd, baselineHash: baseline.baselineHash, includePaths: ['context', 'specs', 'docs'] });

	const payload = {
		baseline,
		aggregate: report.aggregate,
		warnThreshold: args.warnThreshold,
		failThreshold: args.failThreshold,
		files: report.files,
	};

	if (args.json) {
		process.stdout.write(JSON.stringify(payload, null, 2) + '\n');
		process.exit(exitCode({
			aggregate: report.aggregate,
			warnThreshold: args.warnThreshold,
			failThreshold: args.failThreshold,
			failOnThreshold: args.failOnThreshold,
		}));
	}

	if (args.summary) {
		printSummary({ report, warnThreshold: args.warnThreshold, failThreshold: args.failThreshold });
	} else {
		printHumanReport({ report, warnThreshold: args.warnThreshold, failThreshold: args.failThreshold });
	}
	process.exit(
		exitCode({
			aggregate: report.aggregate,
			warnThreshold: args.warnThreshold,
			failThreshold: args.failThreshold,
			failOnThreshold: args.failOnThreshold,
		})
	);
}

main().catch((err) => {
	process.stderr.write(`update-context-freshness failed: ${err?.message || String(err)}\n`);
	process.exit(2);
});
