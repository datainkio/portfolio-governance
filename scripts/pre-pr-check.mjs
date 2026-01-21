#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
	const args = {
			warnThreshold: 10,
			failThreshold: 20,
			baseline: null,
			includeGitDirty: true,
			targets: ['aix'],
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
		if (token === '--targets') {
			const raw = argv[i + 1];
			if (raw) {
				args.targets = raw
					.split(',')
					.map((t) => t.trim())
					.filter(Boolean);
			}
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
	--targets <list>        Comma-separated: aix,frontend,backend (default: aix)
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

function runNodeScript({ scriptPath, args, cwd, label }) {
	const nodeArgs = [scriptPath, ...args];
	const result = spawnSync(process.execPath, nodeArgs, {
		cwd,
		encoding: 'utf8',
	});

	return {
		scriptRel: label || scriptPath,
		status: result.status ?? 1,
		stdout: (result.stdout || '').trimEnd(),
		stderr: (result.stderr || '').trimEnd(),
	};
}

function runNodeCheck({ filePath }) {
	const result = spawnSync(process.execPath, ['--check', filePath], {
		cwd: process.cwd(),
		encoding: 'utf8',
	});

	return {
		scriptRel: `${filePath} (--check)`,
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

async function pathExists(absolutePath) {
	try {
		await fs.access(absolutePath);
		return true;
	} catch {
		return false;
	}
}

function normalizeTargets(targets) {
	const allowed = new Set(['aix', 'frontend', 'backend']);
	const normalized = targets.map((t) => t.toLowerCase());
	const invalid = normalized.filter((t) => !allowed.has(t));
	return { normalized, invalid };
}

function printHuman(results, summary, notices) {
	if (summary.ok) {
		process.stdout.write('Pre-PR Check: OK (no updates recommended)\n');
		if (notices.length > 0) {
			process.stdout.write('\nNotes:\n');
			for (const note of notices) process.stdout.write(`- ${note}\n`);
		}
		return;
	}

	process.stdout.write('Pre-PR Check: UPDATE RECOMMENDED\n\n');
	if (notices.length > 0) {
		process.stdout.write('Notes:\n');
		for (const note of notices) process.stdout.write(`- ${note}\n`);
		process.stdout.write('\n');
	}

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

	const { normalized: targets, invalid } = normalizeTargets(args.targets);
	if (invalid.length > 0) {
		process.stderr.write(`Unknown target(s): ${invalid.join(', ')}\n`);
		printHelp();
		process.exit(1);
	}

	const includeGitDirtyArgs = args.includeGitDirty ? ['--include-git-dirty'] : [];
	const baselineArgs = args.baseline ? ['--baseline', args.baseline] : [];
	const notices = [];
	const rootMap = {
		aix: '.',
		frontend: '../frontend',
		backend: '../backend',
	};

	const syntaxChecks = [
		runNodeCheck({ filePath: path.join(__dirname, 'context-refresh.mjs') }),
		runNodeCheck({ filePath: path.join(__dirname, 'update-context-freshness.mjs') }),
		runNodeCheck({ filePath: path.join(__dirname, 'lib', 'drift.js') }),
		runNodeCheck({ filePath: path.join(__dirname, 'pre-pr-check.mjs') }),
	];

	const results = [...syntaxChecks];

	for (const target of targets) {
		const targetRoot = path.resolve(process.cwd(), rootMap[target]);

		results.push(
			runNodeScript({
				scriptPath: path.join(__dirname, 'current-goals-check.mjs'),
				args: ['--fail-on-update', ...includeGitDirtyArgs],
				cwd: targetRoot,
				label: `${target}: current-goals-check.mjs`,
			})
		);
		results.push(
			runNodeScript({
				scriptPath: path.join(__dirname, 'context-refresh.mjs'),
				args: [
					'--warn-threshold',
					String(args.warnThreshold),
					'--fail-threshold',
					String(args.failThreshold),
					...baselineArgs,
				],
				cwd: targetRoot,
				label: `${target}: context-refresh.mjs`,
			})
		);

		const docsRoot = path.join(targetRoot, 'docs');
		if (!(await pathExists(docsRoot))) {
			notices.push(`Skipping docs link check for ${target}: docs/ not found.`);
			continue;
		}

		results.push(
			runNodeScript({
				scriptPath: path.join(__dirname, 'markdown-link-check-local.mjs'),
				args: ['--root', 'docs', '--max', '50'],
				cwd: targetRoot,
				label: `${target}: markdown-link-check-local.mjs`,
			})
		);
	}

	const summary = summarizeResults(results);

	if (args.json) {
		process.stdout.write(
			JSON.stringify(
				{
					ok: summary.ok,
					notices,
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

	printHuman(results, summary, notices);
	process.exit(summary.ok ? 0 : 1);
}

main().catch((err) => {
	process.stderr.write(String(err?.stack || err) + '\n');
	process.exit(1);
});
