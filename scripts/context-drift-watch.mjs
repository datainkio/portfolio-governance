#!/usr/bin/env node
/**
 * ---
 * aix:
 *   id: aix.scripts.context-drift-watch
 *   role: AIX script: scripts/context-drift-watch.mjs
 *   status: stable
 *   surface: internal
 *   scope: aix
 *   runtime: node
 *   tags:
 *     - aix
 *     - scripts
 *     - context-drift-watch.mjs
 * ---
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const DEFAULT_IGNORE_DIRS = new Set([
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
		includeFrontend: false,
		includeBackend: false,
		open: false,
		json: false,
		debounceMs: 250,
		help: false,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (token === '--include-frontend') {
			args.includeFrontend = true;
			continue;
		}
		if (token === '--include-backend') {
			args.includeBackend = true;
			continue;
		}
		if (token === '--open') {
			args.open = true;
			continue;
		}
		if (token === '--json') {
			args.json = true;
			continue;
		}
		if (token === '--debounceMs') {
			args.debounceMs = Number(argv[i + 1]) || args.debounceMs;
			i += 1;
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
  node scripts/context-drift-watch.mjs [options]

Options:
  --include-frontend     Watch ../frontend for changes too
  --include-backend      Watch ../backend for changes too
  --open                 Open changed files in VS Code (requires 'code' CLI)
  --debounceMs <n>       Debounce bursty FS events (default: 250)
  --json                 Emit JSON lines instead of human output
  -h, --help             Show help

Notes:
  This is a lightweight drift signal tool (not a linter).
  It’s meant to pair with:
    - tasks: Check Context Freshness (All)
    - tasks: Check Current Goals
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

function shouldIgnore(absolutePath) {
	const parts = absolutePath.split(path.sep);
	return parts.some((p) => DEFAULT_IGNORE_DIRS.has(p));
}

function tryOpenInVSCode(absolutePath) {
	const result = spawnSync('code', ['-g', absolutePath], { stdio: 'ignore' });
	return result.status === 0;
}

function watchDir({ rootDir, id, absoluteDir, args }) {
	const pending = new Map();

	const watcher = fs
		.watch(absoluteDir, { recursive: true }, (eventType, filename) => {
			if (!filename) return;
			const absolutePath = path.join(absoluteDir, filename);
			if (shouldIgnore(absolutePath)) return;

			const now = Date.now();
			const key = `${eventType}:${absolutePath}`;
			pending.set(key, { eventType, absolutePath, when: now });
		})
		.catch((err) => {
			process.stderr.write(`Failed to watch ${absoluteDir}: ${String(err)}\n`);
		});

	const interval = setInterval(() => {
		const now = Date.now();
		for (const [key, item] of pending.entries()) {
			if (now - item.when < args.debounceMs) continue;
			pending.delete(key);

			const rel = path.relative(rootDir, item.absolutePath);
			if (args.open) tryOpenInVSCode(item.absolutePath);

			if (args.json) {
				process.stdout.write(
					JSON.stringify({
						type: 'drift',
						root: id,
						event: item.eventType,
						path: rel,
						timestamp: new Date().toISOString(),
					}) + '\n'
				);
				continue;
			}

			process.stdout.write(`[drift] ${id} ${item.eventType} ${rel}\n`);
		}
	}, Math.max(50, Math.min(1000, args.debounceMs)));

	const cleanup = async () => {
		clearInterval(interval);
		try {
			const w = await watcher;
			w.close();
		} catch {
			// ignore
		}
	};

	return cleanup;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		printHelp();
		process.exit(0);
	}

	const rootDir = process.cwd();
	const watchTargets = [
		{ id: 'aix:context', abs: path.join(rootDir, 'context') },
		{ id: 'aix:docs', abs: path.join(rootDir, 'docs') },
		{ id: 'aix:specs', abs: path.join(rootDir, 'specs') },
	];

	if (args.includeFrontend) watchTargets.push({ id: 'frontend', abs: path.resolve(rootDir, '../frontend') });
	if (args.includeBackend) watchTargets.push({ id: 'backend', abs: path.resolve(rootDir, '../backend') });

	const existing = [];
	for (const t of watchTargets) {
		if (await pathExists(t.abs)) existing.push(t);
	}

	if (existing.length === 0) {
		process.stderr.write('No watch targets found.\n');
		process.exit(1);
	}

	if (!args.json) {
		process.stdout.write(`Watching ${existing.length} roots (debounce ${args.debounceMs}ms)...\n`);
		for (const t of existing) process.stdout.write(`- ${t.id}: ${t.abs}\n`);
	}

	const cleanups = existing.map((t) => watchDir({ rootDir, id: t.id, absoluteDir: t.abs, args }));

	const shutdown = async () => {
		for (const c of cleanups) await c();
		process.exit(0);
	};

	process.on('SIGINT', shutdown);
	process.on('SIGTERM', shutdown);

	// Keep process alive.
	// eslint-disable-next-line no-constant-condition
	while (true) {
		// eslint-disable-next-line no-await-in-loop
		await new Promise((r) => setTimeout(r, 60_000));
	}
}

main().catch((err) => {
	process.stderr.write(String(err?.stack || err) + '\n');
	process.exit(1);
});
