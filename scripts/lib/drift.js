/**
 * ---
 * aix:
 *   id: aix.scripts.drift
 *   role: Compute drift scoring for context and specs.
 *   status: stable
 *   surface: internal
 *   owner: AIX
 *   tags:
 *     - drift
 *     - metrics
 *     - git
 *   scope: aix
 *   runtime: node
 *   perf:
 *     readPriority: high
 *     cacheSafe: true
 *     critical: true
 * ---
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const DEFAULT_BASELINE_FILE = 'context/drift-baseline.json';
const DEFAULT_BRANCH = 'origin/main';
const MAGNITUDE_DENOMINATOR = 50; // scale line changes to 0-1, cap at 1

const CRITICALITY_WEIGHTS = [
	{ prefix: 'context/constraints', weight: 1.5 },
	{ prefix: 'context/decisions', weight: 1.3 },
	{ prefix: 'context/current-goals', weight: 1.2 },
	{ prefix: 'context/', weight: 1.0 },
	{ prefix: 'docs/decisions', weight: 1.3 },
	{ prefix: 'docs/logs', weight: 0.8 },
	{ prefix: 'specs/', weight: 1.1 },
];

const SEMANTIC_WEIGHTS = {
	structural: 1.3,
	content: 1.0,
	copy: 0.7,
};

function tryExecGit(args, { cwd }) {
	try {
		return execFileSync('git', args, {
			cwd,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe'],
		}).trim();
	} catch {
		return null;
	}
}

function execGit(args, { cwd }) {
	return execFileSync('git', args, {
		cwd,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
	}).trim();
}

async function readJsonIfExists(absolutePath) {
	try {
		const raw = await fs.readFile(absolutePath, 'utf8');
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function resolveBaseline({ cwd, baselineArg, baselineFile = DEFAULT_BASELINE_FILE, defaultBranch = DEFAULT_BRANCH }) {
	const validateHash = (hash) => {
		const resolved = tryExecGit(['rev-parse', hash], { cwd });
		return resolved && /^[a-f0-9]{7,40}$/i.test(resolved) ? resolved : null;
	};

	if (baselineArg) {
		const resolved = validateHash(baselineArg);
		if (!resolved) throw new Error(`Invalid baseline hash: ${baselineArg}`);
		return { baselineHash: resolved, source: 'flag' };
	}

	const baselinePath = path.join(cwd, baselineFile);
	const filePayload = readJsonIfExists(baselinePath);
	return filePayload.then((payload) => {
		const hash = payload?.baselineHash;
		if (hash) {
			const resolved = validateHash(hash);
			if (!resolved) throw new Error(`Baseline hash from ${baselineFile} is invalid or missing locally: ${hash}`);
			return { baselineHash: resolved, source: 'file', note: payload?.notes || null, branch: payload?.branch || null };
		}

		const resolvedDefault = validateHash(defaultBranch);
		if (!resolvedDefault) throw new Error(`Default branch ${defaultBranch} not found locally; run git fetch.`);
		return { baselineHash: resolvedDefault, source: 'default' };
	});
}

function criticalityWeight(relPath) {
	const normalized = relPath.replace(/\\/g, '/');
	for (const entry of CRITICALITY_WEIGHTS) {
		if (normalized.startsWith(entry.prefix)) return entry.weight;
	}
	return 1.0;
}

function classifySemantic(diffText) {
	if (!diffText) return { bucket: 'content', weight: SEMANTIC_WEIGHTS.content };
	const changedLines = diffText
		.split('\n')
		.filter((line) => line.startsWith('+') || line.startsWith('-'))
		.filter((line) => !line.startsWith('+++') && !line.startsWith('---'))
		.map((line) => line.slice(1));

	if (changedLines.length === 0) return { bucket: 'content', weight: SEMANTIC_WEIGHTS.content };

	const structuralHit = changedLines.some((line) => /^#{1,6}\s/.test(line) || /^\s*[-*]\s/.test(line) || /^\d+\.\s/.test(line));
	if (structuralHit) return { bucket: 'structural', weight: SEMANTIC_WEIGHTS.structural };

	const shortAndLight = changedLines.every((line) => line.trim().length <= 50) && changedLines.length <= 3;
	if (shortAndLight) return { bucket: 'copy', weight: SEMANTIC_WEIGHTS.copy };

	return { bucket: 'content', weight: SEMANTIC_WEIGHTS.content };
}

function magnitudeScore({ added, deleted }) {
	const total = Math.max(0, Number(added) || 0) + Math.max(0, Number(deleted) || 0);
	return Math.min(1, total / MAGNITUDE_DENOMINATOR);
}

function parseNumstat(raw) {
	return raw
		.trim()
		.split('\n')
		.filter(Boolean)
		.map((line) => {
			const [added, deleted, file] = line.split('\t');
			return { added: Number(added) || 0, deleted: Number(deleted) || 0, file };
		});
}

function getDiffText({ cwd, baselineHash, file }) {
	try {
		return execGit(['diff', '--unified=0', baselineHash, '--', file], { cwd });
	} catch {
		return '';
	}
}

export function computeDriftReport({ cwd, baselineHash, includePaths = [] }) {
	const numstatArgs = ['diff', '--numstat', baselineHash];
	if (includePaths.length > 0) numstatArgs.push('--', ...includePaths);
	const raw = tryExecGit(numstatArgs, { cwd }) || '';
	const entries = parseNumstat(raw);

	const files = entries.map((entry) => {
		const rel = entry.file;
		const diffText = getDiffText({ cwd, baselineHash, file: rel });
		const { bucket, weight: semanticWeight } = classifySemantic(diffText);
		const critWeight = criticalityWeight(rel);
		const magnitude = magnitudeScore({ added: entry.added, deleted: entry.deleted });
		const score = magnitude * critWeight * semanticWeight;
		return {
			path: rel,
			added: entry.added,
			deleted: entry.deleted,
			magnitude,
			criticalityWeight: critWeight,
			semanticWeight,
			semanticBucket: bucket,
			score,
			reason: `magnitude=${magnitude.toFixed(2)} crit=${critWeight} semantic=${semanticWeight}(${bucket})`,
		};
	});

	const aggregate = files.reduce((sum, f) => sum + f.score, 0);
	return { baselineHash, files, aggregate };
}

export const DEFAULTS = {
	warnThreshold: 10,
	failThreshold: 20,
	criticalityWeights: CRITICALITY_WEIGHTS,
	semanticWeights: SEMANTIC_WEIGHTS,
};
