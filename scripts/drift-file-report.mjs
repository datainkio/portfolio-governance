#!/usr/bin/env node
/**
 * ---
 * aix:
 *   id: aix.scripts.drift-file-report
 *   role: AIX script: scripts/drift-file-report.mjs
 *   status: stable
 *   surface: internal
 *   scope: aix
 *   runtime: node
 *   tags:
 *     - aix
 *     - scripts
 *     - drift-file-report.mjs
 * ---
 */

import path from 'node:path';
import { computeDriftReport, resolveBaseline } from './lib/drift.js';

const DEFAULT_SCOPE = ['context', 'specs', 'docs'];

function parseArgs(argv) {
	const args = { file: process.env.FILE || process.env.VSCODE_FILE || null, baseline: null, help: false };

	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (token === '--file') {
			args.file = argv[i + 1] || null;
			i += 1;
			continue;
		}
		if (token === '--baseline') {
			args.baseline = argv[i + 1] || null;
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
  node scripts/drift-file-report.mjs --file <path>

Notes:
  - Reports aggregate drift for the standard scope (context, specs, docs)
  - Reports the focused file's drift impact in plain language
  - Only the aggregate drift score and the file drift score are numeric
`);
}

function resolveTarget(cwd, raw) {
	if (!raw) return null;
	const abs = path.isAbsolute(raw) ? raw : path.resolve(cwd, raw);
	const rel = path.relative(cwd, abs).replace(/\\/g, '/');
	if (rel.startsWith('..')) return null;
	return { abs, rel };
}

function magnitudeLabel(magnitude) {
	if (magnitude <= 0) return 'no detected change';
	if (magnitude < 0.2) return 'a light touch';
	if (magnitude < 0.6) return 'a moderate update';
	return 'a large rewrite';
}

function bucketLabel(bucket) {
	if (bucket === 'structural') return 'structure and organization';
	if (bucket === 'copy') return 'light wording tweaks';
	return 'content updates';
}

function criticalityLabel(weight) {
	if (weight >= 1.3) return 'priority scope material';
	if (weight > 1) return 'higher-attention material';
	return 'standard-scope material';
}

function scopeLabel(relPath) {
	const inScope = DEFAULT_SCOPE.some((p) => relPath === p || relPath.startsWith(`${p}/`));
	return inScope ? 'within the standard drift scope' : 'outside the standard drift scope';
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		printHelp();
		process.exit(0);
	}

	const cwd = process.cwd();
	const target = resolveTarget(cwd, args.file);

	if (!target) {
		process.stderr.write('No valid file provided. Focus a file in VS Code or pass --file <path>.\n');
		process.exit(1);
	}

	const baseline = await resolveBaseline({ cwd, baselineArg: args.baseline });
	const overallReport = computeDriftReport({ cwd, baselineHash: baseline.baselineHash, includePaths: DEFAULT_SCOPE });
	const overallScore = Number(overallReport.aggregate.toFixed(2));

	let entry = overallReport.files.find((f) => f.path === target.rel);
	if (!entry) {
		const singleReport = computeDriftReport({ cwd, baselineHash: baseline.baselineHash, includePaths: [target.rel] });
		entry = singleReport.files[0] || null;
	}

	const fileScore = entry ? Number(entry.score.toFixed(2)) : 0;
	const notes = [];

	if (!entry) {
		notes.push('No drift detected for this file; unchanged since the baseline.');
	} else {
		notes.push(`Edits appear to be ${magnitudeLabel(entry.magnitude)}.`);
		notes.push(`Changes look like ${bucketLabel(entry.semanticBucket)}, treated as ${criticalityLabel(entry.criticalityWeight)}.`);
	}

	const scopeNote = scopeLabel(target.rel);
	notes.push(`The file sits ${scopeNote}, so interpret its score accordingly.`);

	process.stdout.write(`Drift check for ${target.rel}\n`);
	process.stdout.write(`Overall drift score: ${overallScore.toFixed(2)}\n`);
	process.stdout.write(`Selected file drift score: ${fileScore.toFixed(2)}\n`);

	process.stdout.write('\nNotes:\n');
	for (const line of notes) process.stdout.write(`- ${line}\n`);
}

main().catch((err) => {
	process.stderr.write(`drift-file-report failed: ${err?.message || String(err)}\n`);
	process.exit(2);
});
