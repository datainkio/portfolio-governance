#!/usr/bin/env node
/**
 * ---
 * aix:
 *   id: aix.scripts.markdown-link-check-local
 *   role: AIX script: scripts/markdown-link-check-local.mjs
 *   status: stable
 *   surface: internal
 *   scope: aix
 *   runtime: node
 *   tags:
 *     - aix
 *     - scripts
 *     - markdown-link-check-local.mjs
 * ---
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const IGNORE_DIRS = new Set([
	'.git',
	'node_modules',
	'_site',
	'dist',
	'build',
	'coverage',
	'.next',
	'.nuxt',
	'.turbo',
	'.cache',
	'.parcel-cache',
	'logs',
	'.obsidian',
]);

function parseArgs(argv) {
	const args = {
		root: 'docs',
		max: 50,
		json: false,
		help: false,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (token === '--root') {
			args.root = argv[i + 1] || args.root;
			i += 1;
			continue;
		}
		if (token === '--max') {
			args.max = Number(argv[i + 1]) || args.max;
			i += 1;
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
  node scripts/markdown-link-check-local.mjs [options]

Options:
  --root <dir>   Root directory to scan (default: docs)
  --max <n>      Max broken links to print (default: 50)
  --json         Emit JSON payload
  -h, --help     Show help

Rules:
  - Existence-only: checks that linked local files exist (no network)
  - Ignores: http(s), mailto, tel, javascript, data, #anchors
  - Supports: relative links, and repo-root-ish links like /docs/...
  - Tries friendly fallbacks when extension missing:
      foo -> foo.md, foo/index.md
`);
}

async function pathExists(p) {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

function isProbablyExternal(href) {
	return /^(https?:|mailto:|tel:|javascript:|data:)/i.test(href);
}

function stripFragmentAndQuery(href) {
	const noHash = href.split('#')[0];
	return noHash.split('?')[0];
}

function normalizeSlashes(p) {
	return p.split('\\').join('/');
}

function isMarkdownFile(p) {
	return p.toLowerCase().endsWith('.md');
}

async function listMarkdownFiles(rootDir) {
	const results = [];

	async function walk(dir) {
		let entries;
		try {
			entries = await fs.readdir(dir, { withFileTypes: true });
		} catch {
			return;
		}

		for (const entry of entries) {
			if (entry.name === '.DS_Store') continue;
			const abs = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				if (IGNORE_DIRS.has(entry.name)) continue;
				await walk(abs);
				continue;
			}

			if (!entry.isFile()) continue;
			if (!isMarkdownFile(entry.name)) continue;
			results.push(abs);
		}
	}

	await walk(rootDir);
	results.sort();
	return results;
}

function extractInlineLinks(markdown) {
	// Minimal, pragmatic matcher for inline markdown links: [text](href "title")
	// We intentionally skip image links by ignoring leading '!'.
	const links = [];
	const re = /(^|[^!])\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
	let match;
	while ((match = re.exec(markdown))) {
		links.push({ href: match[2] });
	}
	return links;
}

async function resolveLinkTarget({ href, fileAbs, repoRootAbs }) {
	const raw = href.trim();
	if (!raw) return { kind: 'skip', reason: 'empty' };
	if (raw.startsWith('#')) return { kind: 'skip', reason: 'anchor' };
	if (isProbablyExternal(raw)) return { kind: 'skip', reason: 'external' };

	const cleaned = stripFragmentAndQuery(raw);
	if (!cleaned) return { kind: 'skip', reason: 'anchor-or-query-only' };

	// Treat site-root style links like /docs/foo.md as repo-root relative.
	const isRepoRootStyle = cleaned.startsWith('/');
	const base = isRepoRootStyle ? repoRootAbs : path.dirname(fileAbs);
	const targetAbs = path.resolve(base, cleaned.replace(/^\//, ''));

	// If it exists as-is, great.
	if (await pathExists(targetAbs)) return { kind: 'ok', targetAbs };

	// Friendly fallbacks.
	const ext = path.extname(targetAbs);
	if (!ext) {
		const md = `${targetAbs}.md`;
		if (await pathExists(md)) return { kind: 'ok', targetAbs: md };

		const indexMd = path.join(targetAbs, 'index.md');
		if (await pathExists(indexMd)) return { kind: 'ok', targetAbs: indexMd };
	}

	// If it looks like a directory link, try index.md.
	if (cleaned.endsWith('/')) {
		const indexMd = path.join(targetAbs, 'index.md');
		if (await pathExists(indexMd)) return { kind: 'ok', targetAbs: indexMd };
	}

	return { kind: 'missing', targetAbs };
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		printHelp();
		process.exit(0);
	}

	const repoRootAbs = process.cwd();
	const scanRootAbs = path.resolve(repoRootAbs, args.root);

	if (!(await pathExists(scanRootAbs))) {
		process.stderr.write(`Root not found: ${scanRootAbs}\n`);
		process.exit(1);
	}

	const mdFiles = await listMarkdownFiles(scanRootAbs);
	const broken = [];

	for (const fileAbs of mdFiles) {
		const content = await fs.readFile(fileAbs, 'utf8');
		const links = extractInlineLinks(content);

		for (const { href } of links) {
			const resolved = await resolveLinkTarget({ href, fileAbs, repoRootAbs });
			if (resolved.kind !== 'missing') continue;

			broken.push({
				file: normalizeSlashes(path.relative(repoRootAbs, fileAbs)),
				href,
				target: normalizeSlashes(path.relative(repoRootAbs, resolved.targetAbs)),
			});

			if (broken.length >= Math.max(1, args.max)) break;
		}

		if (broken.length >= Math.max(1, args.max)) break;
	}

	const ok = broken.length === 0;

	if (args.json) {
		process.stdout.write(
			JSON.stringify(
				{
					ok,
					root: normalizeSlashes(path.relative(repoRootAbs, scanRootAbs)),
					broken,
				},
				null,
				2
			) + '\n'
		);
		process.exit(ok ? 0 : 1);
	}

	if (ok) {
		process.stdout.write(`Markdown link check OK: ${path.relative(repoRootAbs, scanRootAbs)}\n`);
		process.exit(0);
	}

	process.stdout.write(`Markdown link check FAILED (showing up to ${args.max}):\n`);
	for (const b of broken) {
		process.stdout.write(`- ${b.file}: ${b.href} -> missing ${b.target}\n`);
	}
	process.exit(1);
}

main().catch((err) => {
	process.stderr.write(String(err?.stack || err) + '\n');
	process.exit(1);
});
