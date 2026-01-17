#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

const SIDECAR_REL = 'context/.freshness.json';

function parseArgs(argv) {
	const args = {
		maxAgeDays: 7,
		failOnUpdate: false,
		includeGitDirty: false,
		requireSidecar: false,
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
		if (token === '--fail-on-update') {
			args.failOnUpdate = true;
			continue;
		}
		if (token === '--include-git-dirty') {
			args.includeGitDirty = true;
			continue;
		}
		if (token === '--require-sidecar') {
			args.requireSidecar = true;
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
  node scripts/context-freshness-check.mjs [options]

Options:
	--maxAgeDays <n>      Recommend update if freshness baseline is older than N days (default: 7)
  --fail-on-update      Exit 1 if any context file update is recommended
  --include-git-dirty   Treat uncommitted changes as a recommendation signal
	--require-sidecar     Require context/.freshness.json for freshness (no Last updated fallback)
  --json                Emit JSON payload to stdout
  -h, --help            Show help
`);
}

function sha256(text) {
	return crypto.createHash('sha256').update(text).digest('hex');
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

async function evaluateFile({ rootDir, relPath, maxAgeDays, includeGitDirty }) {
	const absolutePath = path.join(rootDir, relPath);

	if (!(await pathExists(absolutePath))) {
		return {
			ok: false,
			recommended: true,
			score: 3,
			file: relPath,
			lastUpdated: null,
			reasons: [`Missing file at ${relPath}`],
			signals: [],
		};
	}

	const content = await fs.readFile(absolutePath, 'utf8');
	const lastUpdated = parseLastUpdated(content);
	const now = new Date();
	const contentHash = sha256(content);

	const reasons = [];
	const signals = [];
	let score = 0;

	// Freshness is primarily tracked via the sidecar (context/.freshness.json).
	// We keep the in-file Last updated for observability and as a fallback signal.
	signals.push({ id: 'lastUpdatedInFile', value: lastUpdated?.raw || null });

	const isGitRepo = Boolean(tryExecGit(['rev-parse', '--is-inside-work-tree'], { cwd: rootDir }));
	if (isGitRepo) {
		const status = tryExecGit(['status', '--porcelain'], { cwd: rootDir });
		const dirty = Boolean(status);
		signals.push({ id: 'gitDirty', value: dirty });
		if (dirty && includeGitDirty) {
			reasons.push('Working tree has uncommitted changes');
			score += 1;
		}
	}

	const sinceMs = lastUpdated ? lastUpdated.date.getTime() : now.getTime() - 14 * 24 * 60 * 60 * 1000;
	return {
		ok: true,
		recommended: false,
		score,
		file: relPath,
		lastUpdated: lastUpdated?.raw || null,
		contentHash,
		reasons,
		signals,
		sinceMs,
	};
}


async function evaluateFileWithDrift({ rootDir, config, maxAgeDays, includeGitDirty, freshnessSidecar, requireSidecar }) {
	const base = await evaluateFile({ rootDir, relPath: config.rel, maxAgeDays, includeGitDirty });
	const now = new Date();
	const signals = [...(base.signals || [])];
	const reasons = [...(base.reasons || [])];
	let score = base.score || 0;

	const sidecarEntry = freshnessSidecar?.files?.[config.rel] || null;
	const reviewedAtRaw = sidecarEntry?.reviewedAt || null;
	const reviewedAtDate = parseIsoDate(reviewedAtRaw);
	const sidecarContentHash = sidecarEntry?.contentHash || null;

	if (sidecarContentHash && base.contentHash && sidecarContentHash !== base.contentHash) {
		reasons.push('Freshness sidecar is out of sync with file content (run git commit hook to refresh)');
		score += 3;
	}

	let baselineDate = null;
	let baselineSource = null;
	if (reviewedAtDate) {
		baselineDate = reviewedAtDate;
		baselineSource = 'sidecar.reviewedAt';
	} else if (!requireSidecar && base.lastUpdated) {
		// base.lastUpdated can be either YYYY-MM-DD or full ISO.
		const fallbackRaw = base.lastUpdated.includes('T') ? base.lastUpdated : `${base.lastUpdated}T00:00:00Z`;
		const fallbackDate = parseIsoDate(fallbackRaw);
		if (fallbackDate) {
			baselineDate = fallbackDate;
			baselineSource = 'file.lastUpdated';
		}
	}

	signals.push({ id: 'freshnessBaseline', value: { source: baselineSource, reviewedAt: reviewedAtRaw } });

	if (!baselineDate) {
		reasons.push('No freshness baseline found (missing sidecar reviewedAt and missing/invalid Last updated)');
		score += 3;
	} else {
		const ageDays = daysBetweenUtc(baselineDate, now);
		signals.push({ id: 'ageDays', value: ageDays });
		if (ageDays > maxAgeDays) {
			reasons.push(`Freshness baseline is ${ageDays}d old (>${maxAgeDays}d)`);
			score += 2;
		}
	}

	const absoluteSelf = path.join(rootDir, config.rel);
	const selfRel = toRelative(absoluteSelf, rootDir);
	const sinceMs = baselineDate ? baselineDate.getTime() : base.sinceMs ?? (now.getTime() - 14 * 24 * 60 * 60 * 1000);

	for (const root of config.watchRoots) {
		const absoluteDir = path.join(rootDir, root.rel);
		if (!(await pathExists(absoluteDir))) continue;

		const recent = await listRecentFiles({ absoluteDir, sinceMs, maxResults: 10 });
		if (recent.length === 0) continue;

		const relativePaths = summarizePaths(recent, rootDir);
		signals.push({ id: `recent:${root.id}`, value: relativePaths });

		const nonSelf = relativePaths.filter((p) => p !== selfRel);
		if (nonSelf.length === 0) continue;

		reasons.push(`New/updated ${root.id} artifacts since last update (${Math.min(nonSelf.length, 10)} shown)`);
		score += root.weight;
	}

	const recommended = score >= 3;
	return {
		...base,
		ok: base.ok,
		recommended,
		score,
		reasons,
		signals,
		sinceMs: undefined,
	};
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

	const results = [];
	for (const config of CONTEXT_FILES) {
		results.push(
			await evaluateFileWithDrift({
				rootDir,
				config,
				maxAgeDays: args.maxAgeDays,
				includeGitDirty: args.includeGitDirty,
				freshnessSidecar,
				requireSidecar: args.requireSidecar,
			})
		);
	}

	const recommendedAny = results.some((r) => r.recommended);
	const payload = {
		ok: true,
		recommended: recommendedAny,
		files: results,
		todayUtc: isoTodayUtc(),
		maxAgeDays: args.maxAgeDays,
	};

	if (args.json) {
		process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
		process.exit(args.failOnUpdate && recommendedAny ? 1 : 0);
	}

	if (!recommendedAny) {
		process.stdout.write('Context looks fresh enough.\n');
		process.exit(0);
	}

	process.stdout.write('Context update recommended.\n\n');
	for (const result of results) {
		if (!result.recommended) continue;
		process.stdout.write(`- ${result.file}\n`);
		for (const reason of result.reasons || []) process.stdout.write(`  - ${reason}\n`);
	}
	process.stdout.write('\nNext: run the task "Refresh Context (Guided)" or open the files under context/.\n');

	process.exit(args.failOnUpdate && recommendedAny ? 1 : 0);
}

main().catch((err) => {
	process.stderr.write(`context-freshness-check failed: ${err?.message || String(err)}\n`);
	process.exit(2);
});
