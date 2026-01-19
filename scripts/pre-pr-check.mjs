#!/usr/bin/env node

import path from 'node:path';
import { spawnSync } from 'node:child_process';

function parseArgs(argv) {
	const args = {
			warnThreshold: 10,
			failThreshold: 20,
			baseline: null,
			includeGitDirty: true,
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
		if (token === '--no-include-git-dirty') {
			args.includeGitDirty = false;
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
  node scripts/pre-pr-check.mjs [options]

Options:
	--warn-threshold <n>    Warn when drift score >= n (default: 10)
	--fail-threshold <n>    Fail when drift score >= n (default: 20)
	--baseline <hash>       Override baseline hash for drift checks
	--no-include-git-dirty  Do not treat git dirty as a recommendation signal (passed to goals check only)
	--json                  Emit JSON summary
	-h, --help              Show help

What it does:
  1) Check Current Goals (CI mode)
	2) Check Context Drift (CI mode)
	3) Check AIX docs markdown links (local-only)

Exit codes:
  0 = all checks OK
  1 = one or more checks recommend updates
`);
}

function runNodeScript({ scriptRel, args }) {
	const nodeArgs = [scriptRel, ...args];
	const result = spawnSync(process.execPath, nodeArgs, {
		cwd: process.cwd(),
		encoding: 'utf8',
	});

	return {
		scriptRel,
		status: result.status ?? 1,
		stdout: (result.stdout || '').trimEnd(),
		stderr: (result.stderr || '').trimEnd(),
	};
}

function runNodeCheck({ fileRel }) {
	const result = spawnSync(process.execPath, ['--check', fileRel], {
		cwd: process.cwd(),
		encoding: 'utf8',
	});

	return {
		scriptRel: `${fileRel} (--check)`,
		status: result.status ?? 1,
		stdout: (result.stdout || '').trimEnd(),
		stderr: (result.stderr || '').trimEnd(),
	};
}

function summarizeResults(results) {
	const failed = results.filter((r) => r.status !== 0);
	return {
		ok: failed.length === 0,
		failed: failed.map((r) => ({ script: r.scriptRel, status: r.status })),
	};
}

function printHuman(results, summary) {
	if (summary.ok) {
		process.stdout.write('Pre-PR Check: OK (no updates recommended)\n');
		return;
	}

	process.stdout.write('Pre-PR Check: UPDATE RECOMMENDED\n\n');

	for (const r of results) {
		if (r.status === 0) continue;
		if (r.stdout) process.stdout.write(r.stdout + '\n');
		if (r.stderr) process.stdout.write(r.stderr + '\n');
	}
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		printHelp();
		process.exit(0);
	}

	const includeGitDirtyArgs = args.includeGitDirty ? ['--include-git-dirty'] : [];
	const baselineArgs = args.baseline ? ['--baseline', args.baseline] : [];

	const syntaxChecks = [
		runNodeCheck({ fileRel: path.join('scripts', 'context-refresh.mjs') }),
		runNodeCheck({ fileRel: path.join('scripts', 'update-context-freshness.mjs') }),
		runNodeCheck({ fileRel: path.join('scripts', 'lib', 'drift.js') }),
		runNodeCheck({ fileRel: path.join('scripts', 'pre-pr-check.mjs') }),
	];

	const results = [
		...syntaxChecks,
		runNodeScript({
			scriptRel: path.join('scripts', 'current-goals-check.mjs'),
			args: ['--fail-on-update', ...includeGitDirtyArgs],
		}),
		runNodeScript({
			scriptRel: path.join('scripts', 'context-refresh.mjs'),
			args: [
				'--warn-threshold',
				String(args.warnThreshold),
				'--fail-threshold',
				String(args.failThreshold),
				...baselineArgs,
			],
		}),
		runNodeScript({
			scriptRel: path.join('scripts', 'markdown-link-check-local.mjs'),
			args: ['--root', 'docs', '--max', '50'],
		}),
	];

	const summary = summarizeResults(results);

	if (args.json) {
		process.stdout.write(
			JSON.stringify(
				{
					ok: summary.ok,
					checks: results.map((r) => ({
						script: r.scriptRel,
						exitCode: r.status,
						stdout: r.stdout,
						stderr: r.stderr,
					})),
				},
				null,
				2
			) + '\n'
		);
		process.exit(summary.ok ? 0 : 1);
	}

	printHuman(results, summary);
	process.exit(summary.ok ? 0 : 1);
}

main().catch((err) => {
	process.stderr.write(String(err?.stack || err) + '\n');
	process.exit(1);
});
