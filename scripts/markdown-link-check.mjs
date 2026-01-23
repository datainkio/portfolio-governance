/**
 * ---
 * aix:
 *   id: aix.scripts.markdown-link-check
 *   role: AIX script: scripts/markdown-link-check.mjs
 *   status: stable
 *   surface: internal
 *   scope: aix
 *   runtime: node
 *   tags:
 *     - aix
 *     - scripts
 *     - markdown-link-check.mjs
 * ---
 */
/** @format */

import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_SKIP_DIRS = new Set(['node_modules', '.git', '_site']);

function parseArgs(argv) {
  const args = {
    root: process.cwd(),
    json: true,
    max: 200,
    skip: new Set(DEFAULT_SKIP_DIRS),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--root') {
      args.root = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === '--max') {
      args.max = Number(argv[i + 1] ?? args.max);
      i += 1;
      continue;
    }

    if (token === '--text') {
      args.json = false;
      continue;
    }

    if (token === '--skip') {
      const val = argv[i + 1] ?? '';
      for (const item of val.split(',').map(s => s.trim()).filter(Boolean)) {
        args.skip.add(item);
      }
      i += 1;
      continue;
    }
  }

  return args;
}

function* walk(dir, skipDirs) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, ent.name);

    if (ent.isDirectory()) {
      if (skipDirs.has(ent.name)) continue;
      yield* walk(fullPath, skipDirs);
      continue;
    }

    if (ent.isFile() && ent.name.endsWith('.md')) {
      yield fullPath;
    }
  }
}

function stripFencedCode(markdown) {
  // Remove triple-backtick blocks (common fenced code); leaves inline code alone.
  return markdown.replace(/```[\s\S]*?```/g, '');
}

function extractLinks(markdown) {
  // Handles normal markdown links and images: [text](href) and ![alt](href)
  // Note: intentionally simple; avoids executing markdown or parsing nested parentheses.
  const re = /!?\[[^\]]*\]\(([^)]+)\)/g;
  const links = [];
  let match;

  while ((match = re.exec(markdown))) {
    const raw = match[1]?.trim();
    if (!raw) continue;

    // Strip optional titles: (path "title")
    const href = raw.includes(' "') ? raw.split(' "')[0] : raw;

    links.push(href);
  }

  return links;
}

function isSkippableHref(href) {
  if (!href) return true;
  if (href.startsWith('#')) return true;
  if (/^(https?:|mailto:|tel:)/i.test(href)) return true;
  if (href.startsWith('/')) return true; // site-root, not a local file check
  return false;
}

function resolveTarget(fromFile, href) {
  const baseDir = path.dirname(fromFile);
  const target = href.split('#')[0];
  return path.resolve(baseDir, target);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const rootAbs = path.resolve(args.root);

  if (!fs.existsSync(rootAbs)) {
    console.error(`Root not found: ${rootAbs}`);
    process.exit(2);
  }

  const broken = [];
  let filesScanned = 0;
  let linksChecked = 0;

  for (const fileAbs of walk(rootAbs, args.skip)) {
    filesScanned += 1;
    const raw = fs.readFileSync(fileAbs, 'utf8');
    const text = stripFencedCode(raw);
    const links = extractLinks(text);

    for (const href of links) {
      if (isSkippableHref(href)) continue;

      linksChecked += 1;
      const resolved = resolveTarget(fileAbs, href);

      if (!fs.existsSync(resolved)) {
        broken.push({
          file: path.relative(rootAbs, fileAbs),
          href,
          resolved: path.relative(rootAbs, resolved),
        });
      }
    }
  }

  const result = {
    root: rootAbs,
    filesScanned,
    linksChecked,
    brokenCount: broken.length,
    broken: broken.slice(0, args.max),
  };

  if (args.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(`Root: ${result.root}\n`);
    process.stdout.write(`Files scanned: ${result.filesScanned}\n`);
    process.stdout.write(`Links checked: ${result.linksChecked}\n`);
    process.stdout.write(`Broken: ${result.brokenCount}\n`);
    for (const item of result.broken) {
      process.stdout.write(`- ${item.file} -> ${item.href} (missing: ${item.resolved})\n`);
    }
  }

  process.exit(broken.length === 0 ? 0 : 1);
}

main();
