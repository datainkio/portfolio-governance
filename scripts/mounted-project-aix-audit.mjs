#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
	const args = { project: null, probeSubset: 'MP' };
	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (token === '--project' || token === '--projectRoot') {
			args.project = argv[i + 1];
			i += 1;
			continue;
		}
		if (token === '--probeSubset') {
			args.probeSubset = argv[i + 1] || 'MP';
			i += 1;
			continue;
		}
		if (token === '--help' || token === '-h') {
			args.help = true;
		}
	}
	return args;
}

function utcTimestampForFilename(date = new Date()) {
	const pad = (n) => String(n).padStart(2, '0');
	const yyyy = date.getUTCFullYear();
	const mm = pad(date.getUTCMonth() + 1);
	const dd = pad(date.getUTCDate());
	const hh = pad(date.getUTCHours());
	const mi = pad(date.getUTCMinutes());
	const ss = pad(date.getUTCSeconds());
	return `${yyyy}-${mm}-${dd}T${hh}${mi}${ss}Z`;
}

async function pathExists(absolutePath) {
	try {
		await fs.access(absolutePath);
		return true;
	} catch {
		return false;
	}
}

async function safeReadJson(absolutePath) {
	try {
		const raw = await fs.readFile(absolutePath, 'utf8');
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function isFiniteNumber(value) {
	return typeof value === 'number' && Number.isFinite(value);
}

function computeScoreDeltas(baselineScores, currentScores) {
	if (!baselineScores || !currentScores) return null;
	const keys = ['FRA', 'CR', 'HF', 'TTUO', 'CUS', 'overall'];
	const deltas = {};
	for (const key of keys) {
		const baselineValue = baselineScores[key];
		const currentValue = currentScores[key];
		if (!isFiniteNumber(baselineValue) || !isFiniteNumber(currentValue)) {
			return null;
		}
		deltas[key] = currentValue - baselineValue;
	}
	return deltas;
}

function isScoredSnapshotJson(json) {
	if (!json || typeof json !== 'object') return false;
	const scores = json.scores;
	if (!scores || typeof scores !== 'object') return false;
	return (
		isFiniteNumber(scores.FRA) &&
		isFiniteNumber(scores.CR) &&
		isFiniteNumber(scores.HF) &&
		isFiniteNumber(scores.TTUO) &&
		isFiniteNumber(scores.CUS) &&
		isFiniteNumber(scores.overall)
	);
}

async function findEarliestScoredSnapshotName({ auditOutputDir, snapshotNames }) {
	for (const name of snapshotNames) {
		const json = await safeReadJson(path.join(auditOutputDir, name));
		if (isScoredSnapshotJson(json)) return name;
	}
	return null;
}

async function listExistingSnapshots({ auditOutputDir, probeSubset }) {
	let entries;
	try {
		entries = await fs.readdir(auditOutputDir, { withFileTypes: true });
	} catch {
		return [];
	}

	const suffix = `--aix-snapshot--${probeSubset}.json`;
	const files = entries
		.filter((e) => e.isFile() && e.name.endsWith(suffix))
		.map((e) => e.name)
		.sort();

	return files;
}

// Intentionally minimal YAML "parser": only extracts a handful of string fields.
// All fields are optional, and failure to parse should not block audit generation.
async function readManifest(absolutePath) {
	const content = await fs.readFile(absolutePath, 'utf8');

	const getFirstMatch = (regex) => {
		const match = content.match(regex);
		return match?.[1]?.trim() || null;
	};

	return {
		manifestPath: absolutePath,
		auditsDir:
			getFirstMatch(/\bauditsDir\s*:\s*["']?([^\n"']+)["']?\s*$/m) || null,
		startHere:
			getFirstMatch(/\bstartHere\s*:\s*["']?([^\n"']+)["']?\s*$/m) || null,
		readme:
			getFirstMatch(/\breadme\s*:\s*["']?([^\n"']+)["']?\s*$/m) || null,
	};
}

function discoveryConfidence({ hasManifest, hasDocsAiDir, hasCopilotDir }) {
	if (hasManifest) return 'high';
	if (hasDocsAiDir || hasCopilotDir) return 'medium';
	return 'low';
}

function clampScore(value) {
	return Math.max(0, Math.min(5, value));
}

function average(values) {
	const finite = values.filter(isFiniteNumber);
	if (finite.length === 0) return null;
	return finite.reduce((sum, v) => sum + v, 0) / finite.length;
}

function computeHeuristicScores({ confidence, surfaces, signals }) {
	// Discovery-only heuristic scoring: intended as a stopgap until MP1–MP5 probes exist.
	// Scores are 0–5 and should be treated as approximate.
	const confidenceBase =
		confidence === 'high' ? 4.5 : confidence === 'medium' ? 3.5 : 2.5;

	let fra = confidenceBase;
	if (!surfaces.docsAiDirPresent && !surfaces.copilotDirPresent) fra -= 0.5;
	if (!signals.hasStartHere && !signals.hasDocsAiReadme) fra -= 0.5;

	let cr = 4.0;
	if (surfaces.githubAgentsPresent) cr -= 1.0;
	if (!signals.hasManifest) cr -= 0.5;

	// HF is primarily safety. This runner writes new artifacts only and does not run validation commands.
	let hf = 4.5;
	if (confidence === 'low') hf -= 0.5;

	// TTUO: single command yields usable artifacts.
	let ttuo = 4.5;
	if (confidence === 'low') ttuo -= 0.5;

	let cus = confidenceBase;
	if (!signals.hasManifest) cus -= 0.5;
	if (!surfaces.docsAiDirPresent) cus -= 0.5;

	fra = clampScore(fra);
	cr = clampScore(cr);
	hf = clampScore(hf);
	ttuo = clampScore(ttuo);
	cus = clampScore(cus);

	const overall = average([fra, cr, hf, ttuo, cus]);

	return {
		FRA: Number(fra.toFixed(2)),
		CR: Number(cr.toFixed(2)),
		HF: Number(hf.toFixed(2)),
		TTUO: Number(ttuo.toFixed(2)),
		CUS: Number(cus.toFixed(2)),
		overall: overall === null ? null : Number(overall.toFixed(2)),
	};
}

function renderAuditReport({
	projectRoot,
	probeSubset,
	timestamp,
	confidence,
	auditOutputDir,
	surfaces,
	baselineSnapshotName,
	previousSnapshotName,
	currentSnapshotName,
	deltaName,
	deltaStatus,
	scores,
	deltas,
}) {
	const findings = [];

	if (!surfaces.manifestPath) {
		findings.push({
			id: 'F-001',
			severity: 'high',
			summary: 'Missing aix.manifest.yaml',
			evidence: ['No /project-root/aix.manifest.yaml found'],
			recommendation:
				'Create /project-root/aix.manifest.yaml from the scaffold template to improve discovery accuracy and DX.',
		});
	}

	if (surfaces.githubAgentsPresent) {
		findings.push({
			id: 'F-002',
			severity: 'medium',
			summary: 'Potential agent-selection ambiguity (.github/agents present)',
			evidence: ['Found .github/agents/ in mounted project'],
			recommendation:
				'Deconflict selectable agents by relocating to docs (preserve as legacy reference) or otherwise disabling exposure.',
		});
	}

	if (!surfaces.docsAiDirPresent) {
		findings.push({
			id: 'F-003',
			severity: 'medium',
			summary: 'docs/ai not detected',
			evidence: ['No docs/ai directory found (best-effort scan)'],
			recommendation:
				'Consider adding docs/ai entrypoints (README/START_HERE) to improve AIX onboarding and navigation.',
		});
	}

	const findingsMd =
		findings.length === 0
			? '- None detected in discovery-only mode.'
			: findings
					.map((f) => {
						const evidence = f.evidence.map((e) => `  - ${e}`).join('\n');
						return `### ${f.id} — ${f.summary} (${f.severity})\n\n${evidence}\n\n- Recommendation: ${f.recommendation}`;
					})
					.join('\n\n');

	const scoreLines = scores
		? [
			`- FRA: ${scores.FRA}`,
			`- CR: ${scores.CR}`,
			`- HF: ${scores.HF}`,
			`- TTUO: ${scores.TTUO}`,
			`- CUS: ${scores.CUS}`,
			`- Overall: ${scores.overall}`,
		].join('\n')
		: '- (unscored)';

	const deltaLines = deltas
		? [
			`- FRA ${deltas.FRA >= 0 ? '+' : ''}${deltas.FRA.toFixed(2)}`,
			`- CR ${deltas.CR >= 0 ? '+' : ''}${deltas.CR.toFixed(2)}`,
			`- HF ${deltas.HF >= 0 ? '+' : ''}${deltas.HF.toFixed(2)}`,
			`- TTUO ${deltas.TTUO >= 0 ? '+' : ''}${deltas.TTUO.toFixed(2)}`,
			`- CUS ${deltas.CUS >= 0 ? '+' : ''}${deltas.CUS.toFixed(2)}`,
			`- Overall ${deltas.overall >= 0 ? '+' : ''}${deltas.overall.toFixed(2)}`,
		].join('\n')
		: '- (no baseline delta available)';

	return `# AIX Audit (Mounted Project) — ${probeSubset}\n\n## Classification\n\n- Intent: mounted-project AIX audit (report-only, discovery-only)\n- Module: analyst\n\n## Summary\n\n- Mounted project: ${projectRoot}\n- Probe subset: ${probeSubset} (discovery-only runner; heuristic scoring)\n- Discovery confidence: ${confidence}\n- Audit output destination: ${auditOutputDir}\n- Timestamp: ${timestamp}\n\n## Artifacts\n\n- Current snapshot: ${currentSnapshotName}\n- Baseline snapshot: ${baselineSnapshotName || 'none (this run is the baseline)'}\n- Previous snapshot: ${previousSnapshotName || 'none'}\n- Delta artifact: ${deltaName || 'none'} (${deltaStatus || 'n/a'})\n\n## Scores (0–5, heuristic)\n\n${scoreLines}\n\n## Delta vs baseline\n\n${deltaLines}\n\n## Discovered surfaces\n\n- Manifest: ${surfaces.manifestPath || 'none'}\n- .copilot: ${surfaces.copilotDirPresent ? 'present' : 'not found'}\n- docs/ai: ${surfaces.docsAiDirPresent ? 'present' : 'not found'}\n- .github/agents: ${surfaces.githubAgentsPresent ? 'present' : 'not found'}\n- .github/copilot-instructions.md: ${surfaces.copilotInstructionsPresent ? 'present' : 'not found'}\n- .gitignore: ${surfaces.gitignorePresent ? 'present' : 'not found'}\n\n## Findings\n\n${findingsMd}\n\n## Assumptions\n\n- This run writes new artifacts into the audits directory but does not edit existing project files.\n\n## Next actions\n\n- If missing, create /project-root/aix.manifest.yaml from the scaffold template.\n- Replace heuristic scoring with the MP1–MP5 probe harness once implemented.\n`;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help || !args.project) {
		process.stdout.write(
			[
				'Usage:',
				'  node scripts/mounted-project-aix-audit.mjs --project /absolute/path/to/mounted/project [--probeSubset MP]',
				'',
				'Notes:',
				'- Report-only, discovery-only: writes audit artifacts but does not modify existing files.',
				'- Manifest is optional; if present, its auditsDir hint is used when possible.',
			].join('\n') + '\n',
		);
		process.exit(args.help ? 0 : 2);
	}

	const projectRoot = path.resolve(args.project);
	if (!(await pathExists(projectRoot))) {
		throw new Error(`Mounted project root not found: ${projectRoot}`);
	}

	const timestamp = utcTimestampForFilename();
	const probeSubset = args.probeSubset || 'MP';

	const manifestRoot = path.join(projectRoot, 'aix.manifest.yaml');
	const manifestFallback = path.join(projectRoot, 'docs', 'ai', 'aix.manifest.yaml');
	let manifest = null;
	let manifestPath = null;

	try {
		if (await pathExists(manifestRoot)) {
			manifestPath = manifestRoot;
		} else if (await pathExists(manifestFallback)) {
			manifestPath = manifestFallback;
		}
		if (manifestPath) {
			manifest = await readManifest(manifestPath);
		}
	} catch {
		// Ignore manifest parsing failures; treat as missing.
		manifest = null;
		manifestPath = null;
	}

	const auditsDirRel = manifest?.auditsDir || 'docs/ai/audits';
	const auditOutputDir = path.join(projectRoot, auditsDirRel);

	// Ensure the audit output directory exists before surface detection so that
	// repos without pre-existing docs/ai will not be misreported when we create
	// docs/ai/audits as part of report generation.
	await fs.mkdir(auditOutputDir, { recursive: true });

	const surfaces = {
		manifestPath,
		copilotDirPresent: await pathExists(path.join(projectRoot, '.copilot')),
		docsAiDirPresent:
			(await pathExists(path.join(projectRoot, 'docs', 'ai'))) ||
			(auditsDirRel.startsWith('docs/ai/') &&
				(await pathExists(path.join(projectRoot, 'docs', 'ai')))),
		githubAgentsPresent: await pathExists(path.join(projectRoot, '.github', 'agents')),
		copilotInstructionsPresent: await pathExists(
			path.join(projectRoot, '.github', 'copilot-instructions.md'),
		),
		gitignorePresent: await pathExists(path.join(projectRoot, '.gitignore')),
	};

	const confidence = discoveryConfidence({
		hasManifest: Boolean(manifestPath),
		hasDocsAiDir: surfaces.docsAiDirPresent,
		hasCopilotDir: surfaces.copilotDirPresent,
	});

	const startHerePath = manifest?.startHere
		? path.join(projectRoot, manifest.startHere)
		: path.join(projectRoot, 'docs', 'ai', 'START_HERE.md');
	const docsAiReadmePath = manifest?.readme
		? path.join(projectRoot, manifest.readme)
		: path.join(projectRoot, 'docs', 'ai', 'README.md');

	const existingSnapshots = await listExistingSnapshots({ auditOutputDir, probeSubset });
	const baselineSnapshotNameBefore = await findEarliestScoredSnapshotName({
		auditOutputDir,
		snapshotNames: existingSnapshots,
	});
	const previousSnapshotNameBefore =
		existingSnapshots.length > 0 ? existingSnapshots[existingSnapshots.length - 1] : null;

	const reportFilename = `${timestamp}--aix-audit--${probeSubset}.md`;
	const snapshotFilename = `${timestamp}--aix-snapshot--${probeSubset}.json`;
	const deltaFilename = `${timestamp}--aix-delta--${probeSubset}.json`;

	const reportPath = path.join(auditOutputDir, reportFilename);
	const snapshotPath = path.join(auditOutputDir, snapshotFilename);
	const deltaPath = path.join(auditOutputDir, deltaFilename);

	const baselineSnapshotName = baselineSnapshotNameBefore || snapshotFilename;
	const previousSnapshotName = previousSnapshotNameBefore;

	const baselineSnapshotPath = baselineSnapshotNameBefore
		? path.join(auditOutputDir, baselineSnapshotNameBefore)
		: null;
	const baselineSnapshot = baselineSnapshotPath
		? await safeReadJson(baselineSnapshotPath)
		: null;

	const signals = {
		hasManifest: Boolean(manifestPath),
		manifestLocation: manifestPath === manifestRoot ? 'root' : manifestPath ? 'docs/ai' : null,
		hasDocsAiDir: surfaces.docsAiDirPresent,
		hasCopilotDir: surfaces.copilotDirPresent,
		hasStartHere: await pathExists(startHerePath),
		hasDocsAiReadme: await pathExists(docsAiReadmePath),
		githubAgentsPresent: surfaces.githubAgentsPresent,
		denylistViolations: 0,
	};

	const scores = computeHeuristicScores({ confidence, surfaces, signals });

	const snapshot = {
		timestamp,
		projectRoot,
		probeSubset,
		manifestPath,
		discoveryConfidence: confidence,
		auditOutputDir: auditsDirRel,
		status: 'scored-heuristic',
		scores,
		baselineSnapshot: baselineSnapshotName,
		previousSnapshot: previousSnapshotName,
		signals,
	};

	let deltaArtifact = null;
	let baselineDeltas = null;
	if (baselineSnapshotNameBefore) {
		const deltas = computeScoreDeltas(baselineSnapshot?.scores, snapshot.scores);
		baselineDeltas = deltas;
		deltaArtifact = {
			timestamp,
			probeSubset,
			projectRoot,
			baselineSnapshot: baselineSnapshotNameBefore,
			currentSnapshot: snapshotFilename,
			status: deltas ? 'scored' : 'unscored',
			deltas,
			note: deltas
				? null
				: 'Baseline or current scores are missing/unscored; deltas unavailable.',
		};
	}

	const report = renderAuditReport({
		projectRoot,
		probeSubset,
		timestamp,
		confidence,
		auditOutputDir: auditsDirRel,
		surfaces,
		baselineSnapshotName: baselineSnapshotNameBefore,
		previousSnapshotName,
		currentSnapshotName: snapshotFilename,
		deltaName: baselineSnapshotNameBefore ? deltaFilename : null,
		deltaStatus:
			baselineSnapshotNameBefore && baselineDeltas
				? 'scored'
				: baselineSnapshotNameBefore
					? 'unscored'
					: null,
		scores,
		deltas: baselineDeltas,
	});

	const writes = [
		fs.writeFile(reportPath, report, 'utf8'),
		fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8'),
	];
	if (deltaArtifact) {
		writes.push(fs.writeFile(deltaPath, JSON.stringify(deltaArtifact, null, 2) + '\n', 'utf8'));
	}
	await Promise.all(writes);

	process.stdout.write(
		[
			'Mounted project AIX audit written:',
			`- Report:   ${reportPath}`,
			`- Snapshot: ${snapshotPath}`,
			deltaArtifact ? `- Delta:    ${deltaPath}` : null,
		]
			.filter(Boolean)
			.join('\n') + '\n',
	);
}

main().catch((err) => {
	process.stderr.write(`Error: ${err.message}\n`);
	process.exit(1);
});
