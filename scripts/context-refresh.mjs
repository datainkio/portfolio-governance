#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SIDECAR_REL = 'context/.freshness.json';

function parseArgs(argv) {
	const args = {
		maxAgeDays: 7,
		open: false,
		touch: false,
		touchAll: false,
		json: false,
		help: false,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (token === '--maxAgeDays') {
			const raw = argv[i + 1];
			const parsed = Number(raw);
			if (Number.isFinite(parsed)) args.maxAgeDays = parsed;
			i += 1;
			continue;
		}
		if (token === '--open') {
			args.open = true;
			continue;
		}
		if (token === '--touch') {
			args.touch = true;
			continue;
		}
		if (token === '--touch-all') {
			args.touch = true;
			args.touchAll = true;
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
  node scripts/context-refresh.mjs [options]

Options:
  --maxAgeDays <n>      Use N days as the freshness threshold (default: 7)
  --open               Open context files in VS Code
  --touch              Update Last updated for files that are recommended
  --touch-all          Update Last updated for all context files
  --json               Emit JSON payload
  -h, --help           Show help
\nNotes:
	This is a guided workflow: it reports drift signals using the freshness baseline (sidecar reviewedAt when available).
	Review metadata is recorded automatically on commit via the repo-managed git hook (see scripts/install-git-hooks.mjs).
	This script can optionally bump Last updated, but you should not rely on manual timestamps for freshness.
  It does not rewrite goals/constraints/decisions content.
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

function execBestEffort(command, args, { cwd } = {}) {
	try {
		execFileSync(command, args, {
			cwd,
			encoding: 'utf8',
			stdio: ['ignore', 'ignore', 'ignore'],
		});
		return true;
	} catch {
		return false;
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

async function readJsonIfExists(absolutePath) {
	try {
		const raw = await fs.readFile(absolutePath, 'utf8');
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function parseIsoDate(raw) {
	if (!raw) return null;
	const date = new Date(raw);
	if (Number.isNaN(date.getTime())) return null;
	return date;
}

function parseLastUpdated(markdown) {
	const match = markdown.match(
		/^\s*Last updated:\s*(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?)\s*$/m
	);
	if (!match) return null;

	const raw = match[1];
	const date = raw.includes('T') ? new Date(raw) : new Date(`${raw}T00:00:00Z`);
	if (Number.isNaN(date.getTime())) return null;
	return { raw, date, hasTime: raw.includes('T') };
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
			if (entry.name === '.DS_Store') continue;
			if (entry.name === '.freshness.json') continue;

			let stat;
			try {
				stat = await fs.stat(absolutePath);
			} catch {
				continue;
			}

			if (stat.mtimeMs > sinceMs) {
				results.push({ path: absolutePath, mtimeMs: stat.mtimeMs });
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

function isoNowUtc() {
	return new Date().toISOString();
}

const CONTEXT_FILES = [
	{
		id: 'current-goals',
		rel: 'context/current-goals.md',
		label: 'current-goals',
		watchRoots: [
			{ id: 'context', rel: 'context', weight: 2 },
			{ id: 'specs', rel: 'specs', weight: 2 },
			{ id: 'decisions', rel: 'docs/decisions', weight: 3 },
			{ id: 'logs', rel: 'docs/logs', weight: 1 },
		],
	},
	{
		id: 'constraints',
		rel: 'context/constraints.md',
		label: 'constraints',
		watchRoots: [
			{ id: 'context', rel: 'context', weight: 1 },
			{ id: 'specs', rel: 'specs', weight: 2 },
			{ id: 'decisions', rel: 'docs/decisions', weight: 2 },
		],
	},
	{
		id: 'decisions',
		rel: 'context/decisions.md',
		label: 'decisions',
		watchRoots: [{ id: 'decisions', rel: 'docs/decisions', weight: 3 }],
	},
];

async function evaluate({ rootDir, config, maxAgeDays, freshnessSidecar }) {
	const absolutePath = path.join(rootDir, config.rel);

	const result = {
		id: config.id,
		file: config.rel,
		ok: true,
		recommended: false,
		score: 0,
		lastReviewed: null,
		lastUpdated: null,
		hasTime: false,
		reasons: [],
		signals: [],
		changes: {},
	};

	if (!(await pathExists(absolutePath))) {
		result.ok = false;
		result.recommended = true;
		result.score = 3;
		result.reasons.push(`Missing file at ${config.rel}`);
		return result;
	}

	const content = await fs.readFile(absolutePath, 'utf8');
	const lastUpdated = parseLastUpdated(content);
	const now = new Date();

	const sidecarEntry = freshnessSidecar?.files?.[config.rel] || null;
	const reviewedAtRaw = sidecarEntry?.reviewedAt || null;
	const reviewedAtDate = parseIsoDate(reviewedAtRaw);

	let baselineDate = null;
	let baselineSource = null;
	if (reviewedAtDate) {
		baselineDate = reviewedAtDate;
		baselineSource = 'sidecar.reviewedAt';
		result.lastReviewed = reviewedAtRaw;
	} else if (lastUpdated) {
		baselineDate = lastUpdated.date;
		baselineSource = 'file.lastUpdated';
	}

	result.signals.push({ id: 'freshnessBaseline', value: { source: baselineSource, reviewedAt: reviewedAtRaw } });

	if (lastUpdated) {
		result.lastUpdated = lastUpdated.raw;
		result.hasTime = lastUpdated.hasTime;
	}

	if (!baselineDate) {
		result.recommended = true;
		result.score += 3;
		result.reasons.push('No freshness baseline found (missing sidecar reviewedAt and missing/invalid Last updated)');
	} else {
		const ageDays = daysBetweenUtc(baselineDate, now);
		result.signals.push({ id: 'ageDays', value: ageDays });
		if (ageDays > maxAgeDays) {
			result.score += 2;
			result.reasons.push(`Freshness baseline is ${ageDays}d old (>${maxAgeDays}d)`);
		}
	}

	const sinceMs = baselineDate ? baselineDate.getTime() : now.getTime() - 14 * 24 * 60 * 60 * 1000;
	const selfRel = toRelative(absolutePath, rootDir);

	for (const root of config.watchRoots) {
		const absoluteDir = path.join(rootDir, root.rel);
		if (!(await pathExists(absoluteDir))) continue;

		const recent = await listRecentFiles({ absoluteDir, sinceMs, maxResults: 10 });
		if (recent.length === 0) continue;

		const relativePaths = summarizePaths(recent, rootDir);
		result.changes[root.id] = relativePaths;
		result.signals.push({ id: `recent:${root.id}`, value: relativePaths });

		const nonSelf = relativePaths.filter((p) => p !== selfRel);
		if (nonSelf.length === 0) continue;

		result.score += root.weight;
		result.reasons.push(`New/updated ${root.id} artifacts since last update (${Math.min(nonSelf.length, 10)} shown)`);
	}

	result.recommended = result.score >= 3;
	return result;
}

function updateLastUpdatedLine(markdown, { replacement }) {
	const lineRegex = /^\s*Last updated:\s*.*$/m;
	if (lineRegex.test(markdown)) {
		return markdown.replace(lineRegex, `Last updated: ${replacement}`);
	}

	const lines = markdown.split(/\r?\n/);
	const headingIndex = lines.findIndex((l) => l.trim().startsWith('# '));
	if (headingIndex >= 0) {
		lines.splice(headingIndex + 1, 0, '', `Last updated: ${replacement}`, '');
		return lines.join('\n');
	}

	return `Last updated: ${replacement}\n\n${markdown}`;
}

async function maybeTouch({ rootDir, evaluation, touchAll }) {
	if (!evaluation.ok) return { touched: false, reason: 'missing' };
	if (!touchAll && !evaluation.recommended) return { touched: false, reason: 'not-recommended' };

	const absolutePath = path.join(rootDir, evaluation.file);
	const content = await fs.readFile(absolutePath, 'utf8');
	const lastUpdated = parseLastUpdated(content);
	const replacement = lastUpdated?.hasTime ? isoNowUtc() : isoTodayUtc();
	const next = updateLastUpdatedLine(content, { replacement });

	if (next === content) return { touched: false, reason: 'no-change' };
	await fs.writeFile(absolutePath, next, 'utf8');
	return { touched: true, replacement };
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

	const freshnessSidecar = await readJsonIfExists(path.join(rootDir, SIDECAR_REL));

	const evaluations = [];
	for (const config of CONTEXT_FILES) {
		evaluations.push(await evaluate({ rootDir, config, maxAgeDays: args.maxAgeDays, freshnessSidecar }));
	}

	const recommendedAny = evaluations.some((e) => e.recommended);
	const payload = {
		ok: true,
		todayUtc: isoTodayUtc(),
		maxAgeDays: args.maxAgeDays,
		recommended: recommendedAny,
		files: evaluations,
	};

	const touches = [];
	if (args.touch) {
		for (const evaluation of evaluations) {
			touches.push({
				file: evaluation.file,
				...(await maybeTouch({ rootDir, evaluation, touchAll: args.touchAll })),
			});
		}
		payload.touches = touches;
	}

	if (args.open) {
		// Best-effort: open in VS Code when available.
		execBestEffort('code', evaluations.map((e) => path.join(rootDir, e.file)), { cwd: rootDir });
	}

	if (args.json) {
		process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
		process.exit(0);
	}

	process.stdout.write('Context refresh (guided)\n\n');
	for (const evaluation of evaluations) {
		process.stdout.write(`== ${evaluation.file} ==\n`);
		process.stdout.write(`Last reviewed: ${evaluation.lastReviewed || '(missing)'}\n`);
		process.stdout.write(`Last updated: ${evaluation.lastUpdated || '(missing)'}\n`);
		process.stdout.write(`Recommended: ${evaluation.recommended ? 'yes' : 'no'} (score ${evaluation.score})\n`);

		if ((evaluation.reasons || []).length > 0) {
			process.stdout.write('Reasons:\n');
			for (const reason of evaluation.reasons) process.stdout.write(`- ${reason}\n`);
		}

		const changeKeys = Object.keys(evaluation.changes || {});
		if (changeKeys.length > 0) {
			process.stdout.write('Recent changes since last update:\n');
			for (const key of changeKeys) {
				const items = evaluation.changes[key] || [];
				process.stdout.write(`- ${key}:\n`);
				for (const item of items) process.stdout.write(`  - ${item}\n`);
			}
		}

		process.stdout.write('\n');
	}

	if (args.touch) {
		process.stdout.write('Touched Last updated for:\n');
		for (const t of touches) {
			if (t.touched) process.stdout.write(`- ${t.file} -> ${t.replacement}\n`);
		}
		process.stdout.write('\n');
	}

	process.stdout.write('Next: edit the recommended files (keep bullets short), then re-run the freshness check.\n');
	process.exit(0);
}

main().catch((err) => {
	process.stderr.write(`context-refresh failed: ${err?.message || String(err)}\n`);
	process.exit(2);
});
