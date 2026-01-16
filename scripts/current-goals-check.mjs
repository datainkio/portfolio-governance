#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function parseArgs(argv) {
	const args = {
		file: 'context/current-goals.md',
		maxAgeDays: 7,
		failOnUpdate: false,
		json: false,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (token === '--file') {
			args.file = argv[i + 1] || args.file;
			i += 1;
			continue;
		}
		if (token === '--maxAgeDays') {
			const raw = argv[i + 1];
			const parsed = Number(raw);
			if (Number.isFinite(parsed)) args.maxAgeDays = parsed;
			i += 1;
			continue;
		}
		if (token === '--fail-on-update') {
			args.failOnUpdate = true;
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
  --maxAgeDays <n>      Recommend update if older than N days (default: 7)
  --fail-on-update      Exit 1 if update is recommended
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

function parseLastUpdated(markdown) {
	const match = markdown.match(
		/^\s*Last updated:\s*(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?)\s*$/m
	);
	if (!match) return null;

	const raw = match[1];
	const iso = raw;
	const date = raw.includes('T') ? new Date(raw) : new Date(`${raw}T00:00:00Z`);
	if (Number.isNaN(date.getTime())) return null;
	return { iso, date };
}

function daysBetweenUtc(a, b) {
	const msPerDay = 24 * 60 * 60 * 1000;
	const start = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
	const end = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
	return Math.floor((end - start) / msPerDay);
}

async function listRecentFiles({ absoluteDir, sinceMs, maxResults = 20 }) {
	const results = [];

	async function walk(dir) {
		let entries;
		try {
			entries = await fs.readdir(dir, { withFileTypes: true });
		} catch {
			return;
		}

		for (const entry of entries) {
			const absolutePath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				if (entry.name === 'node_modules' || entry.name === '.git') continue;
				await walk(absolutePath);
				continue;
			}
			if (!entry.isFile()) continue;

			let stat;
			try {
				stat = await fs.stat(absolutePath);
			} catch {
				continue;
			}

			if (stat.mtimeMs >= sinceMs) {
				results.push({
					path: absolutePath,
					mtimeMs: stat.mtimeMs,
				});
			}
		}
	}

	await walk(absoluteDir);

	results.sort((a, b) => b.mtimeMs - a.mtimeMs);
	return results.slice(0, maxResults);
}

function toRelative(absolutePath, rootDir) {
	return path.relative(rootDir, absolutePath) || '.';
}

function summarizePaths(files, rootDir) {
	return files.map((f) => toRelative(f.path, rootDir));
}

function isoTodayUtc() {
	const now = new Date();
	const pad = (n) => String(n).padStart(2, '0');
	return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
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

	const content = await fs.readFile(goalsPath, 'utf8');
	const lastUpdated = parseLastUpdated(content);
	const now = new Date();

	const reasons = [];
	const signals = [];
	let score = 0;

	if (!lastUpdated) {
		reasons.push('No parseable "Last updated: YYYY-MM-DD" line found');
		score += 3;
	} else {
		const ageDays = daysBetweenUtc(lastUpdated.date, now);
		if (ageDays > args.maxAgeDays) {
			reasons.push(`Last updated ${ageDays}d ago (>${args.maxAgeDays}d)`);
			score += 2;
		}
		signals.push({ id: 'ageDays', value: ageDays });
	}

	const isGitRepo = Boolean(tryExecGit(['rev-parse', '--is-inside-work-tree'], { cwd: rootDir }));
	let dirty = false;
	if (isGitRepo) {
		const status = tryExecGit(['status', '--porcelain'], { cwd: rootDir });
		dirty = Boolean(status);
		if (dirty) {
			reasons.push('Working tree has uncommitted changes');
			score += 1;
		}
		signals.push({ id: 'gitDirty', value: dirty });
	}

	const sinceMs = lastUpdated ? lastUpdated.date.getTime() : now.getTime() - 14 * 24 * 60 * 60 * 1000;
	const watchRoots = [
		{ id: 'context', rel: 'context', weight: 2 },
		{ id: 'specs', rel: 'specs', weight: 2 },
		{ id: 'decisions', rel: 'docs/decisions', weight: 3 },
		{ id: 'logs', rel: 'docs/logs', weight: 1 },
	];

	for (const root of watchRoots) {
		const absoluteDir = path.join(rootDir, root.rel);
		if (!(await pathExists(absoluteDir))) continue;

		const recent = await listRecentFiles({ absoluteDir, sinceMs, maxResults: 10 });
		if (recent.length === 0) continue;

		const relativePaths = summarizePaths(recent, rootDir);
		signals.push({ id: `recent:${root.id}`, value: relativePaths });

		// If the goal file itself is the only thing that changed recently, don't count it as drift.
		const nonSelf = relativePaths.filter((p) => p !== toRelative(goalsPath, rootDir));
		if (nonSelf.length === 0) continue;

		if (root.id === 'logs') {
			reasons.push(`New/updated logs since last update (${Math.min(nonSelf.length, 10)} shown)`);
		} else {
			reasons.push(`New/updated ${root.id} artifacts since last update (${Math.min(nonSelf.length, 10)} shown)`);
		}
		score += root.weight;
	}

	const recommended = score >= 3;

	const payload = {
		ok: true,
		recommended,
		score,
		file: toRelative(goalsPath, rootDir),
		lastUpdated: lastUpdated?.iso || null,
		todayUtc: isoTodayUtc(),
		maxAgeDays: args.maxAgeDays,
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

		process.stdout.write('Update recommended for current-goals.\n\n');
		for (const reason of reasons) process.stdout.write(`- ${reason}\n`);
		process.stdout.write(`\nNext: open ${payload.file} and adjust Now/Next/Not Now.\n`);
	}

	process.exit(args.failOnUpdate && recommended ? 1 : 0);
}

main().catch((err) => {
	process.stderr.write(`current-goals-check failed: ${err?.message || String(err)}\n`);
	process.exit(2);
});
