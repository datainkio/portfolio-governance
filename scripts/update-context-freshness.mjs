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

const DEFAULT_ALERT_THRESHOLD = 6;
const DEFAULT_MAX_AGE_DAYS = 14;

const ANSI = {
	reset: '\x1b[0m',
	bold: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
};

function parseArgs(argv) {
	const args = {
		init: false,
		alertThreshold: DEFAULT_ALERT_THRESHOLD,
		maxAgeDays: DEFAULT_MAX_AGE_DAYS,
		failOnThreshold: false,
		noColor: false,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (token === '--init') {
			args.init = true;
			continue;
		}
		if (token === '--help' || token === '-h') {
			args.help = true;
			continue;
		}
		if (token === '--alert-threshold') {
			const n = Number(argv[i + 1]);
			if (Number.isFinite(n) && n >= 0) args.alertThreshold = n;
			i += 1;
			continue;
		}
		if (token === '--maxAgeDays') {
			const n = Number(argv[i + 1]);
			if (Number.isFinite(n) && n > 0) args.maxAgeDays = n;
			i += 1;
			continue;
		}
		if (token === '--fail-on-threshold') {
			args.failOnThreshold = true;
			continue;
		}
		if (token === '--no-color' || token === '--noColor') {
			args.noColor = true;
			continue;
		}
	}

	return args;
}

function printHelp() {
	process.stdout.write(`\
Usage:
  node scripts/update-context-freshness.mjs [options]

Options:
  --init         Initialize context/.freshness.json for all context files (one-time)
	--alert-threshold <n>  Alert on commit when aggregate drift score >= n (default: ${DEFAULT_ALERT_THRESHOLD})
	--maxAgeDays <n>       Pass-through for drift scoring (default: ${DEFAULT_MAX_AGE_DAYS})
	--fail-on-threshold    Exit non-zero when the drift threshold is exceeded (commit-blocking)
	--no-color             Disable ANSI color output
  -h, --help     Show help

Notes:
  Default mode runs during pre-commit and only updates entries for staged context files.
	It also runs a commit-time drift threshold check and prints an alert when exceeded.
`);
}

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

function tryExecNodeJson(scriptArgs, { cwd } = {}) {
	try {
		const raw = execFileSync(process.execPath, scriptArgs, {
			cwd,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim();
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function style(text, { color, bold = false, enabled = true } = {}) {
	if (!enabled) return text;
	const colorCode = color && ANSI[color] ? ANSI[color] : '';
	const boldCode = bold ? ANSI.bold : '';
	return `${boldCode}${colorCode}${text}${ANSI.reset}`;
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

async function getWorkingTreeContent(relPath, { rootDir }) {
	try {
		return await fs.readFile(path.join(rootDir, relPath), 'utf8');
	} catch {
		return null;
	}
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		printHelp();
		process.exit(0);
	}

	const cwd = process.cwd();
	const gitRoot = tryExecGit(['rev-parse', '--show-toplevel'], { cwd });
	if (!gitRoot) {
		process.stdout.write('update-context-freshness: not a git repo; skipping\n');
		process.exit(0);
	}

	const rootDir = gitRoot;

	let targetFiles = [];
	if (args.init) {
		targetFiles = [...CONTEXT_FILES];
	} else {
		const staged = execGit(['diff', '--cached', '--name-only'], { cwd: rootDir })
			.split('\n')
			.map((s) => s.trim())
			.filter(Boolean);

		targetFiles = CONTEXT_FILES.filter((p) => staged.includes(p));
	}

	const sidecarAbs = path.join(rootDir, SIDECAR_REL);

	// 1) Update sidecar only when relevant context files are staged (or init mode).
	if (args.init || targetFiles.length > 0) {
		const existing = (await readJsonIfExists(sidecarAbs)) || {};
		const next = {
			version: 1,
			updatedAt: isoNowUtc(),
			files: {
				...(existing.files || {}),
			},
		};

		let changed = false;
		for (const relPath of targetFiles) {
			const content = args.init
				? await getWorkingTreeContent(relPath, { rootDir })
				: getStagedContent(relPath, { cwd: rootDir });

			if (content == null) continue;

			const hash = sha256(content);
			const prev = next.files[relPath];
			if (!prev || prev.contentHash !== hash) {
				next.files[relPath] = {
					reviewedAt: isoNowUtc(),
					contentHash: hash,
				};
				changed = true;
			}
		}

		if (changed) {
			await fs.mkdir(path.dirname(sidecarAbs), { recursive: true });
			await fs.writeFile(sidecarAbs, stableStringify(next), 'utf8');

			// Stage the sidecar so the commit includes the freshness record.
			execGit(['add', SIDECAR_REL], { cwd: rootDir });

			process.stdout.write(
				args.init
					? `update-context-freshness: initialized and staged ${SIDECAR_REL}\n`
					: `update-context-freshness: updated and staged ${SIDECAR_REL}\n`
			);
		}
	}

	// 2) On commit, alert (do not block) if drift has accumulated beyond threshold.
	if (!args.init && args.alertThreshold >= 0) {
		const payload = tryExecNodeJson(
			[
				'scripts/context-freshness-check.mjs',
				'--json',
				'--require-sidecar',
				'--maxAgeDays',
				String(args.maxAgeDays),
			],
			{ cwd: rootDir }
		);

		const useColor = !args.noColor && !process.env.NO_COLOR;
		const files = Array.isArray(payload?.files) ? payload.files : [];
		const aggregateScore = files.reduce((sum, f) => sum + (Number(f?.score) || 0), 0);

		if (aggregateScore >= args.alertThreshold && aggregateScore > 0) {
			process.stdout.write(
				`\n${style('CONTEXT FRESHNESS: THRESHOLD EXCEEDED', { color: 'red', bold: true, enabled: useColor })}\n` +
				`${style(`drift score ${aggregateScore} >= ${args.alertThreshold}`, { color: 'red', enabled: useColor })}\n` +
				`Consider reviewing/updating context (task: \"Refresh Context (Guided)\").\n`
			);

			const toShow = files
				.filter((f) => (Number(f?.score) || 0) > 0)
				.sort((a, b) => (Number(b?.score) || 0) - (Number(a?.score) || 0))
				.slice(0, 3);

			for (const f of toShow) {
				const score = Number(f?.score) || 0;
				const tag = f?.recommended ? 'RECOMMENDED' : 'drift';
				process.stdout.write(`- ${f.file} (${tag}, score=${score})\n`);
			}
			process.stdout.write('\n');

			if (args.failOnThreshold) {
				process.stderr.write(
					`${style('context-freshness: commit blocked (threshold exceeded)', {
						color: 'red',
						bold: true,
						enabled: useColor,
					})}\n`
				);
				process.stderr.write('Next: update/review context, or use `git commit --no-verify` to bypass.\n');
				process.exit(1);
			}
		} else {
			process.stdout.write(
				`${style('context-freshness: OK', { color: 'green', bold: true, enabled: useColor })} ` +
				`(drift score ${aggregateScore} < ${args.alertThreshold})\n`
			);
		}
	}

	process.exit(0);
}

main().catch((err) => {
	process.stderr.write(`update-context-freshness failed: ${err?.message || String(err)}\n`);
	process.exit(2);
});
