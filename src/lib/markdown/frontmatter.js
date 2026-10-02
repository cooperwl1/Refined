// @ts-check
/**
 * Frontmatter — the custom header block at the top of every markdown file.
 *
 *   ---
 *   title: The things we choose to keep
 *   description: A short essay about objects and attention.
 *   date: 2026-10-02
 *   section: essays
 *   tags: [design, attention]
 *   ---
 *
 * This is a small, dependency-free parser for the subset of YAML a blog needs:
 *   key: value              strings (quoted or bare), numbers, booleans, null
 *   key: [a, b, "c d"]      inline lists
 *   key:                    block lists
 *     - a
 *     - b
 *   key: |                  multi-line text (| keeps newlines, > folds them)
 *   # comments
 *
 * Plain JS (with JSDoc types) so the build-time validator script can import it
 * without a TypeScript toolchain.
 */

/** @typedef {string | number | boolean | null | string[]} FrontmatterValue */
/** @typedef {Record<string, FrontmatterValue>} FrontmatterData */

export const SECTIONS = /** @type {const} */ (['essays', 'objects', 'notes']);

/**
 * Split a raw markdown file into its frontmatter data and body.
 * @param {string} raw
 * @returns {{ data: FrontmatterData, body: string, errors: string[], bodyLine: number }}
 */
export function parseFrontmatter(raw) {
	const text = raw.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
	const match = /^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(text);
	if (!match) return { data: {}, body: text, errors: [], bodyLine: 1 };

	const block = match[1];
	const body = text.slice(match[0].length);
	const bodyLine = match[0].split('\n').length;
	/** @type {FrontmatterData} */
	const data = {};
	/** @type {string[]} */
	const errors = [];
	const lines = block.split('\n');

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (!line.trim() || /^\s*#/.test(line)) continue;

		const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
		if (!kv) {
			errors.push(`Line ${i + 2}: can't read "${line.trim()}" — expected "key: value".`);
			continue;
		}
		const key = kv[1];
		const rest = stripComment(kv[2]).trim();

		// Block scalar: key: | or key: >
		if (rest === '|' || rest === '>') {
			/** @type {string[]} */
			const chunk = [];
			while (i + 1 < lines.length && (/^\s+/.test(lines[i + 1]) || lines[i + 1] === '')) {
				chunk.push(lines[++i].replace(/^\s{2}/, ''));
			}
			while (chunk.length && chunk[chunk.length - 1] === '') chunk.pop();
			data[key] = rest === '|' ? chunk.join('\n') : chunk.join(' ').replace(/\s+/g, ' ').trim();
			continue;
		}

		// Block list: key: (empty) followed by "- item" lines
		if (rest === '') {
			/** @type {string[]} */
			const items = [];
			while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
				items.push(String(scalar(lines[++i].replace(/^\s*-\s+/, ''))));
			}
			data[key] = items.length ? items : null;
			continue;
		}

		// Inline list
		if (rest.startsWith('[')) {
			if (!rest.endsWith(']')) {
				errors.push(`Line ${i + 2}: list for "${key}" is missing a closing "]".`);
				continue;
			}
			data[key] = splitList(rest.slice(1, -1)).map((s) => String(scalar(s)));
			continue;
		}

		data[key] = scalar(rest);
	}

	return { data, body, errors, bodyLine };
}

/** @param {string} s */
function stripComment(s) {
	let quote = '';
	for (let i = 0; i < s.length; i++) {
		const c = s[i];
		if (quote) {
			if (c === quote) quote = '';
		} else if (c === '"' || c === "'") {
			quote = c;
		} else if (c === '#' && (i === 0 || /\s/.test(s[i - 1]))) {
			return s.slice(0, i);
		}
	}
	return s;
}

/** @param {string} s */
function splitList(s) {
	/** @type {string[]} */
	const out = [];
	let cur = '';
	let quote = '';
	for (const c of s) {
		if (quote) {
			if (c === quote) quote = '';
			cur += c;
		} else if (c === '"' || c === "'") {
			quote = c;
			cur += c;
		} else if (c === ',') {
			out.push(cur.trim());
			cur = '';
		} else cur += c;
	}
	if (cur.trim()) out.push(cur.trim());
	return out.filter(Boolean);
}

/**
 * @param {string} raw
 * @returns {string | number | boolean | null}
 */
function scalar(raw) {
	const s = raw.trim();
	if (/^".*"$/.test(s)) return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n');
	if (/^'.*'$/.test(s)) return s.slice(1, -1).replace(/''/g, "'");
	if (/^(true|yes)$/i.test(s)) return true;
	if (/^(false|no)$/i.test(s)) return false;
	if (/^(null|~)$/i.test(s) || s === '') return null;
	if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
	return s;
}

/* =========================================================
   SCHEMA — what each post's header is allowed to contain
   ========================================================= */

/**
 * @typedef {Object} PostMeta
 * @property {string} title
 * @property {string} description
 * @property {string} date           ISO date YYYY-MM-DD
 * @property {string | null} updated
 * @property {string} section        essays | objects | notes | page
 * @property {string[]} tags
 * @property {number | null} number
 * @property {boolean} featured
 * @property {boolean} draft
 * @property {string | null} slug
 * @property {string | null} cover
 * @property {string | null} coverAlt
 */

const KNOWN_KEYS = new Set([
	'title',
	'description',
	'date',
	'updated',
	'section',
	'tags',
	'number',
	'featured',
	'draft',
	'slug',
	'cover',
	'coverAlt'
]);

/**
 * Validate + normalize frontmatter into a typed PostMeta.
 * @param {FrontmatterData} data
 * @param {{ defaultSection?: string, isPage?: boolean }} [opts]
 * @returns {{ meta: PostMeta, errors: string[], warnings: string[] }}
 */
export function normalizeMeta(data, opts = {}) {
	/** @type {string[]} */
	const errors = [];
	/** @type {string[]} */
	const warnings = [];

	for (const key of Object.keys(data)) {
		if (!KNOWN_KEYS.has(key)) warnings.push(`Unknown field "${key}" will be ignored.`);
	}

	const title = typeof data.title === 'string' || typeof data.title === 'number' ? String(data.title).trim() : '';
	if (!title) errors.push('Missing "title".');

	const date = toDate(data.date);
	if (!opts.isPage) {
		if (data.date == null) errors.push('Missing "date" (use YYYY-MM-DD).');
		else if (!date) errors.push(`"date" must look like 2026-10-02, got "${data.date}".`);
	}

	const updated = data.updated == null ? null : toDate(data.updated);
	if (data.updated != null && !updated) errors.push(`"updated" must look like 2026-10-02, got "${data.updated}".`);

	let section = opts.isPage ? 'page' : String(data.section ?? opts.defaultSection ?? '').toLowerCase();
	if (!opts.isPage && !(/** @type {readonly string[]} */ (SECTIONS)).includes(section)) {
		errors.push(`"section" must be one of ${SECTIONS.join(', ')} — got "${section || '(empty)'}".`);
		section = 'essays';
	}

	/** @type {string[]} */
	let tags = [];
	if (Array.isArray(data.tags)) tags = data.tags;
	else if (typeof data.tags === 'string') tags = data.tags.split(',');
	else if (data.tags != null) errors.push('"tags" must be a list, e.g. [design, attention].');
	tags = [...new Set(tags.map((t) => slugify(String(t))).filter(Boolean))];

	let number = null;
	if (data.number != null) {
		if (typeof data.number === 'number' && Number.isInteger(data.number)) number = data.number;
		else errors.push(`"number" must be a whole number, got "${data.number}".`);
	}

	for (const key of ['featured', 'draft']) {
		if (data[key] != null && typeof data[key] !== 'boolean') errors.push(`"${key}" must be true or false.`);
	}

	const slug = data.slug == null ? null : slugify(String(data.slug));

	return {
		meta: {
			title,
			description: typeof data.description === 'string' ? data.description.trim() : '',
			date: date ?? '1970-01-01',
			updated,
			section,
			tags,
			number,
			featured: data.featured === true,
			draft: data.draft === true,
			slug: slug || null,
			cover: typeof data.cover === 'string' ? data.cover : null,
			coverAlt: typeof data.coverAlt === 'string' ? data.coverAlt : null
		},
		errors,
		warnings
	};
}

/**
 * @param {FrontmatterValue | undefined} v
 * @returns {string | null}
 */
function toDate(v) {
	if (typeof v !== 'string') return null;
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
	if (!m) return null;
	const d = new Date(`${m[0]}T00:00:00Z`);
	if (Number.isNaN(d.getTime()) || d.getUTCDate() !== Number(m[3])) return null;
	return m[0];
}

/** @param {string} s */
export function slugify(s) {
	return s
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}
