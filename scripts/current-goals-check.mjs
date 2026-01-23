#!/usr/bin/env node
/**
 * ---
 * aix:
 *   id: aix.scripts.current-goals-check
 *   role: AIX script: scripts/current-goals-check.mjs
 *   status: stable
 *   surface: internal
 *   scope: aix
 *   runtime: node
 *   tags:
 *     - aix
 *     - scripts
 *     - current-goals-check.mjs
 * ---
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function parseArgs(argv) {
	const args = {
		file: 'context/current-goals.md',
		failOnUpdate: false,
		includeGitDirty: false,
		json: false,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (token === '--file') {
			args.file = argv[i + 1] || args.file;
			i += 1;
			continue;
		}
		if (token === '--fail-on-update') {
			args.failOnUpdate = true;
			continue;
		}
		if (token === '--include-git-dirty') {
			args.includeGitDirty = true;
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
  node scripts/current-goals-check.mjs [options]

Options:
  --file <path>         Path to current-goals markdown (default: context/current-goals.md)
  --fail-on-update      Exit 1 if update is recommended
	--include-git-dirty   Treat uncommitted changes as a recommendation signal
  --json                Emit JSON payload to stdout
  -h, --help            Show help
`);
}

function tryExecGit(args, { cwd } = {}) {
	try {
		return execFileSync('git', args, {
			cwd,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim();
	} catch {
		return null;
	}
}

async function pathExists(absolutePath) {
	try {
		await fs.access(absolutePath);
		return true;
	} catch {
		return false;
	}
}


function toRelative(absolutePath, rootDir) {
	return path.relative(rootDir, absolutePath) || '.';
}

function summarizePaths(files, rootDir) {
	return files.map((f) => toRelative(f.path, rootDir));
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		printHelp();
		process.exit(0);
	}

	const cwd = process.cwd();
	const gitRoot = tryExecGit(['rev-parse', '--show-toplevel'], { cwd });
	const rootDir = gitRoot || cwd;

	const goalsPath = path.isAbsolute(args.file) ? args.file : path.join(rootDir, args.file);
	if (!(await pathExists(goalsPath))) {
		const payload = {
			ok: false,
			recommended: true,
			reasons: [`Missing current-goals file at ${toRelative(goalsPath, rootDir)}`],
		};
		if (args.json) process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
		else process.stdout.write(`Update recommended: missing ${toRelative(goalsPath, rootDir)}\n`);
		process.exit(args.failOnUpdate ? 1 : 0);
	}

	// Timestamp-free: only honor git-dirty signal when explicitly requested.
	const reasons = [];
	const signals = [];
	let score = 0;

	const isGitRepo = Boolean(tryExecGit(['rev-parse', '--is-inside-work-tree'], { cwd: rootDir }));
	let dirty = false;
	if (isGitRepo) {
		const status = tryExecGit(['status', '--porcelain'], { cwd: rootDir });
		dirty = Boolean(status);
		if (dirty && args.includeGitDirty) {
			reasons.push('Working tree has uncommitted changes');
			score += 1;
		}
		signals.push({ id: 'gitDirty', value: dirty });
	}

	const recommended = score >= 1;

	const payload = {
		ok: true,
		recommended,
		score,
		file: toRelative(goalsPath, rootDir),
		lastUpdated: null,
		reasons,
		signals,
	};

	if (args.json) {
		process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
	} else {
		if (!recommended) {
			process.stdout.write('Current goals look fresh enough.\n');
			process.exit(0);
		}

		for (const reason of reasons) process.stdout.write(`- ${reason}\n`);
	}

	process.exit(args.failOnUpdate && recommended ? 1 : 0);
}

main().catch((err) => {
	process.stderr.write(`current-goals-check failed: ${err?.message || String(err)}\n`);
	process.exit(2);
});
