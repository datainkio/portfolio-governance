#!/usr/bin/env node
/**
 * ---
 * aix:
 *   id: aix.scripts.agent-ops
 *   role: AIX script: scripts/agent-ops.mjs
 *   status: stable
 *   surface: internal
 *   scope: aix
 *   runtime: node
 *   tags:
 *     - aix
 *     - scripts
 *     - agent-ops.mjs
 * ---
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const DEFAULT_IGNORED_SEGMENTS = new Set([
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
	'.obsidian',
]);

function parseArgs(argv) {
	const args = {
		command: null,
		positionals: [],
		yes: false,
		json: false,
		help: false,
		line: null,
		col: null,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (token === '--yes' || token === '-y') {
			args.yes = true;
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
		if (token === '--line') {
			args.line = Number(argv[i + 1]);
			i += 1;
			continue;
		}
		if (token === '--col') {
			args.col = Number(argv[i + 1]);
			i += 1;
			continue;
		}

		if (!args.command) {
			args.command = token;
			continue;
		}

		args.positionals.push(token);
	}

	return args;
}

function printHelp() {
	process.stdout.write(`\
Usage:
  node scripts/agent-ops.mjs <command> [...args] [--yes] [--json]

Commands:
  open <path> [--line <n>] [--col <n>]   Open a path in VS Code (requires 'code' CLI)
  move <from> <to>                      Move/rename file or directory
  delete <path>                         Delete file or directory (recursive)
  mkdir <path>                          Create directory (recursive)
  touch <path>                          Create empty file if missing

Safety:
  - Operates only inside: aix/, ../frontend/, ../backend/
  - Refuses paths under: .git/, node_modules/, _site/, .obsidian/, etc.
  - Non-interactive by default; destructive ops require --yes
`);
}

function fail(message, { code = 1, json = false } = {}) {
	if (json) {
		process.stdout.write(JSON.stringify({ ok: false, error: message }) + '\n');
		process.exit(code);
	}
	process.stderr.write(message + '\n');
	process.exit(code);
}

function isInside(childPath, parentPath) {
	const rel = path.relative(parentPath, childPath);
	return rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function hasIgnoredSegment(absolutePath) {
	const parts = absolutePath.split(path.sep);
	return parts.some((p) => DEFAULT_IGNORED_SEGMENTS.has(p));
}

function resolveAllowedRoots(rootDir) {
	return [
		{ id: 'aix', abs: path.resolve(rootDir) },
		{ id: 'frontend', abs: path.resolve(rootDir, '../frontend') },
		{ id: 'backend', abs: path.resolve(rootDir, '../backend') },
	];
}

function resolveUserPath(rawPath, rootDir) {
	if (!rawPath) return null;
	const expanded = rawPath.startsWith('~')
		? path.join(process.env.HOME || '', rawPath.slice(1))
		: rawPath;
	return path.isAbsolute(expanded) ? path.resolve(expanded) : path.resolve(rootDir, expanded);
}

function assertAllowed(absolutePath, { rootDir, json }) {
	if (!absolutePath) fail('Missing path argument.', { json });
	if (hasIgnoredSegment(absolutePath)) {
		fail(`Refusing to operate on ignored path: ${absolutePath}`, { json });
	}

	const allowedRoots = resolveAllowedRoots(rootDir);
	const insideAny = allowedRoots.some((r) => absolutePath === r.abs || isInside(absolutePath, r.abs));
	if (!insideAny) {
		fail(
			`Refusing to operate outside allowed roots (aix/frontend/backend). Got: ${absolutePath}`,
			{ json }
		);
	}
}

function tryOpenInVSCode(target, { line, col }) {
	const hasLocation = Number.isFinite(line) && line > 0;
	const safeCol = Number.isFinite(col) && col > 0 ? col : 1;
	const arg = hasLocation ? `${target}:${line}:${safeCol}` : target;
	const result = spawnSync('code', ['-g', arg], { stdio: 'ignore' });
	return result.status === 0;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const rootDir = process.cwd();

	if (args.help || !args.command) {
		printHelp();
		process.exit(0);
	}

	const cmd = args.command;

	if (cmd === 'open') {
		const raw = args.positionals[0];
		const absolute = resolveUserPath(raw, rootDir);
		assertAllowed(absolute, { rootDir, json: args.json });

		const ok = tryOpenInVSCode(absolute, { line: args.line, col: args.col });
		if (!ok) {
			fail(
				"Failed to run 'code'. Ensure the VS Code CLI is installed (Shell Command: Install 'code' command in PATH).",
				{ json: args.json }
			);
		}

		if (args.json) process.stdout.write(JSON.stringify({ ok: true, opened: absolute }) + '\n');
		return;
	}

	if (cmd === 'move') {
		if (!args.yes) fail('Refusing to move without --yes.', { json: args.json });
		const rawFrom = args.positionals[0];
		const rawTo = args.positionals[1];
		const fromAbs = resolveUserPath(rawFrom, rootDir);
		const toAbs = resolveUserPath(rawTo, rootDir);
		assertAllowed(fromAbs, { rootDir, json: args.json });
		assertAllowed(toAbs, { rootDir, json: args.json });

		try {
			await fs.access(fromAbs);
		} catch {
			fail(`Source path does not exist: ${fromAbs}`, { json: args.json });
		}

		try {
			await fs.access(toAbs);
			fail(`Destination already exists: ${toAbs}`, { json: args.json });
		} catch {
			// ok
		}

		await fs.mkdir(path.dirname(toAbs), { recursive: true });
		await fs.rename(fromAbs, toAbs);
		if (args.json) process.stdout.write(JSON.stringify({ ok: true, moved: { from: fromAbs, to: toAbs } }) + '\n');
		return;
	}

	if (cmd === 'delete') {
		if (!args.yes) fail('Refusing to delete without --yes.', { json: args.json });
		const raw = args.positionals[0];
		const absolute = resolveUserPath(raw, rootDir);
		assertAllowed(absolute, { rootDir, json: args.json });

		await fs.rm(absolute, { recursive: true, force: false });
		if (args.json) process.stdout.write(JSON.stringify({ ok: true, deleted: absolute }) + '\n');
		return;
	}

	if (cmd === 'mkdir') {
		if (!args.yes) fail('Refusing to mkdir without --yes.', { json: args.json });
		const raw = args.positionals[0];
		const absolute = resolveUserPath(raw, rootDir);
		assertAllowed(absolute, { rootDir, json: args.json });

		await fs.mkdir(absolute, { recursive: true });
		if (args.json) process.stdout.write(JSON.stringify({ ok: true, createdDir: absolute }) + '\n');
		return;
	}

	if (cmd === 'touch') {
		if (!args.yes) fail('Refusing to touch without --yes.', { json: args.json });
		const raw = args.positionals[0];
		const absolute = resolveUserPath(raw, rootDir);
		assertAllowed(absolute, { rootDir, json: args.json });

		await fs.mkdir(path.dirname(absolute), { recursive: true });
		try {
			await fs.access(absolute);
		} catch {
			await fs.writeFile(absolute, '', 'utf8');
		}
		if (args.json) process.stdout.write(JSON.stringify({ ok: true, touched: absolute }) + '\n');
		return;
	}

	fail(`Unknown command: ${cmd}`, { json: args.json });
}

main().catch((err) => {
	process.stderr.write(String(err?.stack || err) + '\n');
	process.exit(1);
});
