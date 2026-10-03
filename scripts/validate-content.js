#!/usr/bin/env node
// Checks every markdown file in /content before a build.
// Runs automatically on `npm run build` (so on every Vercel deploy) and in GitHub Actions.
// A bad date, a missing title or a duplicate URL fails loudly here instead of breaking the site.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { normalizeMeta, parseFrontmatter, SECTIONS } from '../src/lib/markdown/frontmatter.js';

const root = new URL('../content', import.meta.url).pathname;

/** @param {string} dir @returns {string[]} */
function walk(dir) {
	return readdirSync(dir).flatMap((name) => {
		const p = join(dir, name);
		return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
	});
}

let errors = 0;
let warnings = 0;
let count = 0;
const urls = new Map();

for (const file of walk(root)) {
	const rel = relative(root, file);
	const parts = rel.split(sep);
	const base = parts[parts.length - 1].replace(/\.md$/, '');
	if (base.startsWith('_')) continue;
	count++;

	const folder = parts.length > 1 ? parts[0] : '';
	const isPage = folder === 'pages';
	const { data, errors: fmErrors } = parseFrontmatter(readFileSync(file, 'utf8'));
	const res = normalizeMeta(data, {
		defaultSection: /** @type {readonly string[]} */ (SECTIONS).includes(folder) ? folder : undefined,
		isPage
	});

	for (const e of [...fmErrors, ...res.errors]) {
		console.error(`  ✗ content/${rel}: ${e}`);
		errors++;
	}
	for (const w of res.warnings) {
		console.warn(`  ! content/${rel}: ${w}`);
		warnings++;
	}

	const slug = res.meta.slug ?? base.replace(/^\d{4}-\d{2}-\d{2}-/, '');
	const url = isPage ? `/${slug}` : `/${res.meta.section}/${slug}`;
	if (urls.has(url)) {
		console.error(`  ✗ content/${rel}: same URL (${url}) as ${urls.get(url)}`);
		errors++;
	} else urls.set(url, `content/${rel}`);
}

if (errors) {
	console.error(`\n✗ ${errors} problem(s) in content. Fix them and push again.\n`);
	process.exit(1);
}
console.log(`✓ ${count} markdown files look good${warnings ? ` (${warnings} warning(s))` : ''}.`);
