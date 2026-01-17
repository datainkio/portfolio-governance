#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

const SIDECAR_REL = 'context/.freshness.json';
const CONTEXT_FILES = [
	'context/current-goals.md',
	'context/constraints.md',
	'context/decisions.md',
];

function tryExecGit(args, { cwd } = {}) {
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

function execGit(args, { cwd } = {}) {
	return execFileSync('git', args, {
		cwd,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
	}).trim();
}

function sha256(text) {
	return crypto.createHash('sha256').update(text).digest('hex');
}

async function readJsonIfExists(absolutePath) {
	try {
		const raw = await fs.readFile(absolutePath, 'utf8');
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function isoNowUtc() {
	return new Date().toISOString();
}

function stableStringify(value) {
	// Stable-ish stringify: sort top-level keys and per-file keys.
	const sortObject = (obj) => {
		if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
		const out = {};
		for (const key of Object.keys(obj).sort()) {
			out[key] = sortObject(obj[key]);
		}
		return out;
	};
	return `${JSON.stringify(sortObject(value), null, 2)}\n`;
}

function getStagedContent(relPath, { cwd }) {
	// Reads the staged version (index) of a file.
	// Returns null if file isn't in index.
	try {
		return execFileSync('git', ['show', `:${relPath}`], {
			cwd,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		});
	} catch {
		return null;
	}
}

async function main() {
	const cwd = process.cwd();
	const gitRoot = tryExecGit(['rev-parse', '--show-toplevel'], { cwd });
	if (!gitRoot) {
		process.stdout.write('update-context-freshness: not a git repo; skipping\n');
		process.exit(0);
	}

	const rootDir = gitRoot;
	const staged = execGit(['diff', '--cached', '--name-only'], { cwd: rootDir })
		.split('\n')
		.map((s) => s.trim())
		.filter(Boolean);

	const stagedContextFiles = CONTEXT_FILES.filter((p) => staged.includes(p));
	if (stagedContextFiles.length === 0) {
		process.exit(0);
	}

	const sidecarAbs = path.join(rootDir, SIDECAR_REL);
	const existing = (await readJsonIfExists(sidecarAbs)) || {};

	const next = {
		version: 1,
		updatedAt: isoNowUtc(),
		files: {
			...(existing.files || {}),
		},
	};

	let changed = false;
	for (const relPath of stagedContextFiles) {
		const stagedContent = getStagedContent(relPath, { cwd: rootDir });
		if (stagedContent == null) continue;

		const hash = sha256(stagedContent);
		const prev = next.files[relPath];
		if (!prev || prev.contentHash !== hash) {
			next.files[relPath] = {
				reviewedAt: isoNowUtc(),
				contentHash: hash,
			};
			changed = true;
		}
	}

	if (!changed) {
		process.exit(0);
	}

	await fs.mkdir(path.dirname(sidecarAbs), { recursive: true });
	await fs.writeFile(sidecarAbs, stableStringify(next), 'utf8');

	// Stage the sidecar so the commit includes the freshness record.
	execGit(['add', SIDECAR_REL], { cwd: rootDir });

	process.stdout.write(`update-context-freshness: updated and staged ${SIDECAR_REL}\n`);
	process.exit(0);
}

main().catch((err) => {
	process.stderr.write(`update-context-freshness failed: ${err?.message || String(err)}\n`);
	process.exit(2);
});
