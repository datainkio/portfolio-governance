#!/usr/bin/env node
/**
 * ---
 * aix:
 *   id: aix.scripts.adr-spec-sync
 *   role: AIX script: scripts/adr-spec-sync.mjs
 *   status: stable
 *   surface: internal
 *   scope: aix
 *   runtime: node
 *   tags:
 *     - aix
 *     - scripts
 *     - adr-spec-sync.mjs
 * ---
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ADR_ROOT = 'docs/decisions';

async function listMarkdownFiles(dir) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		if (entry.name.startsWith('.')) continue;
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await listMarkdownFiles(full)));
		} else if (entry.isFile() && entry.name.endsWith('.md')) {
			files.push(full);
		}
	}
	return files;
}

function findSpecCandidate(absTarget) {
	if (absTarget.endsWith('.md')) {
		const candidate = absTarget.replace(/\.md$/, '.spec.md');
		return candidate;
	}
	return null;
}

async function fileExists(p) {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

async function processAdr(filePath, repoRoot) {
	const original = await fs.readFile(filePath, 'utf8');
	let updated = original;
	const missing = [];
	let rewrites = 0;

	const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
	let match;
	while ((match = linkRegex.exec(original)) !== null) {
		const fullMatch = match[0];
		const linkText = match[1];
		const linkTarget = match[2];

		if (!linkTarget.includes('specs/') || !linkTarget.endsWith('.md')) continue;

		const absTarget = path.resolve(path.dirname(filePath), linkTarget);
		const exists = await fileExists(absTarget);
		if (exists) continue;

		const candidate = findSpecCandidate(absTarget);
		if (candidate && (await fileExists(candidate))) {
			const relNew = path.relative(path.dirname(filePath), candidate).replace(/\\/g, '/');
			const replacement = `[${linkText}](${relNew})`;
			updated = updated.replace(fullMatch, replacement);
			rewrites += 1;
			continue;
		}

		missing.push({ adr: path.relative(repoRoot, filePath), target: linkTarget });
	}

	if (rewrites > 0 && updated !== original) {
		await fs.writeFile(filePath, updated, 'utf8');
	}

	return { rewrites, missing };
}

async function main() {
	const repoRoot = process.cwd();
	const adrDir = path.join(repoRoot, ADR_ROOT);
	const adrFiles = await listMarkdownFiles(adrDir);

	let totalRewrites = 0;
	const missing = [];

	for (const file of adrFiles) {
		const result = await processAdr(file, repoRoot);
		totalRewrites += result.rewrites;
		missing.push(...result.missing);
	}

	process.stdout.write(`ADR–Spec sync: rewrote ${totalRewrites} link(s)\n`);
	if (missing.length) {
		process.stdout.write('Unresolved links (no matching .spec.md found):\n');
		for (const m of missing) {
			process.stdout.write(`- ${m.adr}: ${m.target}\n`);
		}
		process.exit(1);
	}

	process.stdout.write('All ADR spec links resolved.\n');
	process.exit(0);
}

main().catch((err) => {
	process.stderr.write(`adr-spec-sync failed: ${err?.message || String(err)}\n`);
	process.exit(2);
});
