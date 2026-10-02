/**
 * Refined's markdown parser — written from scratch, no dependencies.
 *
 * markdown string ──► parse() ──► Document (AST) ──► <Markdown /> Svelte components
 *
 * Supported:
 *   # Headings (with automatic or {#custom} ids)      paragraphs, hard breaks
 *   **strong**  *em*  _em_  ~~del~~  ==mark==  `code`  <kbd>⌘K</kbd>
 *   [links](url "title")  [ref links][id]  <https://autolinks>  bare https://urls
 *   ![images](src "caption")  — an image on its own line becomes a <figure>
 *   > blockquotes            - lists / 1. lists / - [x] task lists (nested)
 *   ```lang title="file"     fenced code (``` or ~~~)
 *   | tables | with | :---: alignment |
 *   ---  ***  ___            horizontal rule (the site's "rule" divider)
 *   Footnotes[^1]            [^1]: definitions anywhere
 *   <!-- comments -->        stripped from output
 *
 * Custom containers (Refined specific):
 *   :::note        floating italic sidenote in the margin
 *   :::pullquote   large quote with an orange marker
 *   :::callout Title   boxed aside (also :::tip, :::info, :::warning)
 *   :::aside       quieter boxed aside
 *   :::wide        content that breaks out of the reading column
 *
 * Deliberate choices: no raw HTML (everything is escaped by Svelte), no
 * indented code blocks, and no setext headings — so "---" is always a divider.
 */

import { slugify } from './frontmatter.js';
import type { Align, Block, ContainerKind, Document, Footnote, Inline, ListItem, TocEntry } from './ast';

/* =========================================================
   LINE PATTERNS
   ========================================================= */

const BLANK = /^\s*$/;
const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const CONTAINER_OPEN = /^ {0,3}:{3,}[ \t]*([A-Za-z][\w-]*)[ \t]*(.*?)[ \t]*$/;
const CONTAINER_CLOSE = /^ {0,3}:{3,}[ \t]*$/;
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const RULE = /^ {0,3}(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,})$/;
const QUOTE = /^ {0,3}> ?/;
const LIST = /^( {0,3})([-*+]|\d{1,9}[.)])([ \t]+|$)/;
const FOOTNOTE_DEF = /^ {0,3}\[\^([^\]\s]+)\]:[ \t]*(.*)$/;
const LINK_DEF = /^ {0,3}\[([^\]^][^\]]*)\]:[ \t]*<?(\S+?)>?(?:[ \t]+(?:"([^"]*)"|'([^']*)'|\(([^)]*)\)))?[ \t]*$/;
const TABLE_DELIM = /^ {0,3}\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/;

const CONTAINER_ALIASES: Record<string, ContainerKind> = {
	note: 'note',
	sidenote: 'note',
	margin: 'note',
	pullquote: 'pullquote',
	pull: 'pullquote',
	callout: 'callout',
	tip: 'callout',
	info: 'callout',
	warning: 'callout',
	important: 'callout',
	aside: 'aside',
	wide: 'wide'
};

/* =========================================================
   PARSER
   ========================================================= */

class Parser {
	private linkDefs = new Map<string, { href: string; title?: string }>();
	private footnoteIds = new Set<string>();
	private footnoteDefs = new Map<string, string[]>();
	private footnoteOrder: string[] = [];
	private headingIds = new Map<string, number>();
	toc: TocEntry[] = [];

	parse(markdown: string): Document {
		const source = markdown
			.replace(/\r\n?/g, '\n')
			.replace(/\t/g, '    ')
			.replace(/<!--[\s\S]*?-->/g, '');

		const lines = this.collectDefinitions(source.split('\n'));
		const children = this.blocks(lines);

		// Footnotes are numbered in the order they're first referenced.
		const footnotes: Footnote[] = [];
		for (let k = 0; k < this.footnoteOrder.length; k++) {
			const id = this.footnoteOrder[k];
			const body = this.footnoteDefs.get(id);
			if (body) footnotes.push({ id, index: k + 1, children: this.blocks(body) });
		}

		const text = children.map(blockText).join(' ');
		const firstPara = children.find((b) => b.type === 'paragraph');
		const excerpt = firstPara ? truncate(blockText(firstPara), 200) : '';

		return {
			children,
			footnotes,
			toc: this.toc,
			words: text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length,
			excerpt
		};
	}

	/** Pull out [ref]: url and [^note]: text definitions (outside code fences). */
	private collectDefinitions(lines: string[]): string[] {
		const out: string[] = [];
		let fence: string | null = null;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const f = FENCE.exec(line);
			if (f) {
				const marker = f[1];
				if (fence === null) fence = marker;
				else if (marker[0] === fence[0] && marker.length >= fence.length && !f[2].trim()) fence = null;
				out.push(line);
				continue;
			}
			if (fence !== null) {
				out.push(line);
				continue;
			}

			const fn = FOOTNOTE_DEF.exec(line);
			if (fn) {
				const body = [fn[2]];
				while (i + 1 < lines.length) {
					const next = lines[i + 1];
					if (/^ {2,}\S/.test(next)) body.push(next.replace(/^ {2,4}/, ''));
					else if (BLANK.test(next) && i + 2 < lines.length && /^ {2,}\S/.test(lines[i + 2])) body.push('');
					else break;
					i++;
				}
				this.footnoteIds.add(fn[1]);
				this.footnoteDefs.set(fn[1], body);
				continue;
			}

			const ld = LINK_DEF.exec(line);
			if (ld) {
				const key = ld[1].trim().toLowerCase();
				if (!this.linkDefs.has(key)) {
					this.linkDefs.set(key, { href: ld[2], title: ld[3] ?? ld[4] ?? ld[5] });
				}
				continue;
			}

			out.push(line);
		}
		return out;
	}

	/* ---------- Blocks ---------- */

	blocks(lines: string[]): Block[] {
		const out: Block[] = [];
		let i = 0;

		while (i < lines.length) {
			const line = lines[i];

			if (BLANK.test(line)) {
				i++;
				continue;
			}

			// ``` fenced code
			const fence = FENCE.exec(line);
			if (fence) {
				const marker = fence[1];
				const indent = line.length - line.trimStart().length;
				const { lang, title } = parseInfo(fence[2]);
				const body: string[] = [];
				i++;
				while (i < lines.length) {
					const close = FENCE.exec(lines[i]);
					if (close && close[1][0] === marker[0] && close[1].length >= marker.length && !close[2].trim()) {
						i++;
						break;
					}
					body.push(lines[i].replace(new RegExp(`^ {0,${indent}}`), ''));
					i++;
				}
				out.push({ type: 'code', lang, title, value: body.join('\n') });
				continue;
			}

			// :::container
			const open = CONTAINER_OPEN.exec(line);
			if (open) {
				const name = open[1].toLowerCase();
				const kind = CONTAINER_ALIASES[name] ?? 'callout';
				let title: string | null = open[2] || null;
				if (!title && kind === 'callout' && name !== 'callout') title = capitalize(name);
				if (!title && !(name in CONTAINER_ALIASES)) title = capitalize(name);

				const body: string[] = [];
				let depth = 1;
				i++;
				while (i < lines.length) {
					if (CONTAINER_OPEN.test(lines[i])) depth++;
					else if (CONTAINER_CLOSE.test(lines[i]) && --depth === 0) {
						i++;
						break;
					}
					body.push(lines[i]);
					i++;
				}
				out.push({ type: 'container', kind, title, children: this.blocks(body) });
				continue;
			}

			// stray closing ::: — ignore
			if (CONTAINER_CLOSE.test(line)) {
				i++;
				continue;
			}

			// # heading
			const h = HEADING.exec(line);
			if (h) {
				out.push(this.heading(h[1].length as 1, h[2] ?? ''));
				i++;
				continue;
			}

			// --- rule
			if (RULE.test(line)) {
				out.push({ type: 'rule' });
				i++;
				continue;
			}

			// > blockquote
			if (QUOTE.test(line)) {
				const body: string[] = [];
				while (i < lines.length) {
					const l = lines[i];
					if (QUOTE.test(l)) body.push(l.replace(QUOTE, ''));
					else if (!BLANK.test(l) && body.length && !BLANK.test(body[body.length - 1]) && !this.startsBlock(l)) {
						body.push(l); // lazy continuation
					} else break;
					i++;
				}
				out.push({ type: 'blockquote', children: this.blocks(body) });
				continue;
			}

			// - lists
			if (LIST.test(line)) {
				const { block, next } = this.list(lines, i);
				out.push(block);
				i = next;
				continue;
			}

			// | tables |
			if (line.includes('|') && i + 1 < lines.length && TABLE_DELIM.test(lines[i + 1]) && lines[i + 1].includes('-')) {
				const head = splitRow(line);
				const align: Align[] = splitRow(lines[i + 1]).map((c) => {
					const l = c.startsWith(':');
					const r = c.endsWith(':');
					return l && r ? 'center' : r ? 'right' : l ? 'left' : null;
				});
				if (head.length === align.length) {
					i += 2;
					const rows: Inline[][][] = [];
					while (i < lines.length && !BLANK.test(lines[i]) && lines[i].includes('|')) {
						const cells = splitRow(lines[i]);
						const row = head.map((_, c) => this.inline(cells[c] ?? ''));
						rows.push(row);
						i++;
					}
					out.push({ type: 'table', align, head: head.map((c) => this.inline(c)), rows });
					continue;
				}
			}

			// paragraph
			const para: string[] = [line];
			i++;
			while (i < lines.length && !BLANK.test(lines[i]) && !this.startsBlock(lines[i], true)) {
				para.push(lines[i]);
				i++;
			}
			const children = this.inline(para.map((l) => l.replace(/^ +/, '')).join('\n').replace(/\s+$/, ''));
			const meaningful = children.filter((c) => !(c.type === 'text' && !c.value.trim()));
			if (meaningful.length === 1 && meaningful[0].type === 'image') {
				out.push({ type: 'figure', image: meaningful[0] });
			} else {
				out.push({ type: 'paragraph', children });
			}
		}

		return out;
	}

	/** Can this line interrupt a paragraph / end a lazy continuation? */
	private startsBlock(line: string, interruptingParagraph = false): boolean {
		if (FENCE.test(line) || HEADING.test(line) || RULE.test(line) || QUOTE.test(line)) return true;
		if (CONTAINER_OPEN.test(line) || CONTAINER_CLOSE.test(line)) return true;
		const m = LIST.exec(line);
		if (m) {
			if (!interruptingParagraph) return true;
			// An ordered list only interrupts a paragraph if it starts at 1,
			// so "2026. What a year." in the middle of prose stays prose.
			if (/^\d/.test(m[2])) return parseInt(m[2], 10) === 1 && !BLANK.test(line.slice(m[0].length));
			return !BLANK.test(line.slice(m[0].length));
		}
		return false;
	}

	private heading(level: 1 | 2 | 3 | 4 | 5 | 6, raw: string): Block {
		let text = raw.trim();
		let custom: string | null = null;
		const idMatch = /\s*\{#([\w-]+)\}\s*$/.exec(text);
		if (idMatch) {
			custom = idMatch[1];
			text = text.slice(0, idMatch.index);
		}
		const children = this.inline(text);
		const plain = inlineText(children);
		const base = custom ?? (slugify(plain) || 'section');
		const seen = this.headingIds.get(base) ?? 0;
		this.headingIds.set(base, seen + 1);
		const id = seen ? `${base}-${seen + 1}` : base;
		if (level === 2 || level === 3) this.toc.push({ id, text: plain, level });
		return { type: 'heading', level, id, text: plain, children };
	}

	private list(lines: string[], start: number): { block: Block; next: number } {
		const first = LIST.exec(lines[start])!;
		const ordered = /^\d/.test(first[2]);
		const delimiter = first[2].slice(-1);
		const startNum = ordered ? parseInt(first[2], 10) : 1;
		const items: ListItem[] = [];
		let tight = true;
		let i = start;

		const sibling = (line: string | undefined) => {
			const m = line === undefined ? null : LIST.exec(line);
			return !!m && /^\d/.test(m[2]) === ordered && m[2].slice(-1) === delimiter;
		};

		while (i < lines.length) {
			const m = LIST.exec(lines[i]);
			if (!m || !sibling(lines[i])) break;

			const spaces = m[3].length;
			const contentCol = m[1].length + m[2].length + (spaces === 0 || spaces > 4 ? 1 : spaces);
			const body: string[] = [lines[i].slice(Math.min(contentCol, lines[i].length))];
			let sawBlank = false;
			i++;

			while (i < lines.length) {
				const l = lines[i];
				if (BLANK.test(l)) {
					body.push('');
					sawBlank = true;
					i++;
					continue;
				}
				const indent = l.length - l.trimStart().length;
				if (indent >= contentCol) {
					body.push(l.slice(contentCol));
					i++;
					continue;
				}
				if (sawBlank) break;
				if (LIST.test(l) || this.startsBlock(l)) break;
				body.push(l.trimStart()); // lazy continuation
				i++;
			}

			// Blank lines at the end of an item that's followed by a sibling => loose list.
			let trailing = 0;
			while (body.length && BLANK.test(body[body.length - 1])) {
				body.pop();
				trailing++;
			}
			if (trailing && sibling(lines[i])) tight = false;
			// Blank lines between top-level blocks inside the item => loose list.
			if (body.some((l, k) => k > 0 && BLANK.test(l) && body[k + 1] && !/^ /.test(body[k + 1]) && !LIST.test(body[k + 1]))) {
				tight = false;
			}

			let checked: boolean | null = null;
			const task = /^\[([ xX])\][ \t]+/.exec(body[0] ?? '');
			if (task) {
				checked = task[1] !== ' ';
				body[0] = body[0].slice(task[0].length);
			}

			items.push({ checked, children: this.blocks(body) });

			if (trailing && !sibling(lines[i])) break;
		}

		return { block: { type: 'list', ordered, start: startNum, tight, items }, next: i };
	}

	/* ---------- Inline ---------- */

	inline(src: string): Inline[] {
		const out: Inline[] = [];
		let buf = '';
		let bufStart = 0;
		const push = (ch: string, at: number) => {
			if (!buf) bufStart = at;
			buf += ch;
		};
		const flush = () => {
			if (buf) out.push({ type: 'text', value: typography(buf, src[bufStart - 1]) });
			buf = '';
		};
		const node = (n: Inline) => {
			flush();
			out.push(n);
		};

		let i = 0;
		while (i < src.length) {
			const c = src[i];
			const rest = src.slice(i);

			// Backslash escapes & backslash hard breaks
			if (c === '\\' && i + 1 < src.length) {
				const n = src[i + 1];
				if (n === '\n') {
					node({ type: 'break' });
					i += 2;
					continue;
				}
				if (/[!-/:-@[-`{-~]/.test(n)) {
					push(n, i);
					i += 2;
					continue;
				}
			}

			// Newlines: two trailing spaces = hard break, otherwise a space
			if (c === '\n') {
				if (/ {2,}$/.test(buf)) {
					buf = buf.replace(/ +$/, '');
					node({ type: 'break' });
				} else {
					buf = buf.replace(/ +$/, '');
					push(' ', i);
				}
				i++;
				while (src[i] === ' ') i++;
				continue;
			}

			// `code`
			if (c === '`') {
				const run = /^`+/.exec(rest)![0];
				const close = findCodeClose(src, i + run.length, run.length);
				if (close !== -1) {
					let value = src.slice(i + run.length, close).replace(/\n/g, ' ');
					if (/^ .* $/.test(value) && value.trim()) value = value.slice(1, -1);
					node({ type: 'code', value });
					i = close + run.length;
				} else {
					push(run, i);
					i += run.length;
				}
				continue;
			}

			// ![image](src "title")
			if (c === '!' && src[i + 1] === '[') {
				const link = this.linkAt(src, i + 1);
				if (link) {
					node({ type: 'image', src: link.href, alt: inlineText(this.inline(link.label)), title: link.title });
					i = link.end;
					continue;
				}
			}

			if (c === '[') {
				// [^footnote]
				const fn = /^\[\^([^\]\s]+)\]/.exec(rest);
				if (fn && this.footnoteIds.has(fn[1])) {
					let index = this.footnoteOrder.indexOf(fn[1]) + 1;
					if (!index) index = this.footnoteOrder.push(fn[1]);
					node({ type: 'footnoteRef', id: fn[1], index });
					i += fn[0].length;
					continue;
				}
				// [link](href)
				const link = this.linkAt(src, i);
				if (link) {
					node({
						type: 'link',
						href: link.href,
						title: link.title,
						external: isExternal(link.href),
						children: this.inline(link.label)
					});
					i = link.end;
					continue;
				}
			}

			if (c === '<') {
				// <https://autolink>
				const auto = /^<((?:https?:\/\/|mailto:)[^\s<>]+)>/.exec(rest);
				if (auto) {
					const href = auto[1];
					node({
						type: 'link',
						href,
						external: isExternal(href),
						children: [{ type: 'text', value: href.replace(/^mailto:/, '') }]
					});
					i += auto[0].length;
					continue;
				}
				// <kbd>⌘K</kbd>
				const kbd = /^<kbd>([^<]+)<\/kbd>/i.exec(rest);
				if (kbd) {
					node({ type: 'kbd', value: kbd[1] });
					i += kbd[0].length;
					continue;
				}
			}

			// bare https://urls
			if (c === 'h' && (i === 0 || /[\s(]/.test(src[i - 1]))) {
				const bare = /^https?:\/\/[^\s<]*[^\s<.,:;"')\]!?*_~]/.exec(rest);
				if (bare) {
					node({ type: 'link', href: bare[0], external: true, children: [{ type: 'text', value: bare[0] }] });
					i += bare[0].length;
					continue;
				}
			}

			// Emphasis: * _ ~~ ==
			if (c === '*' || c === '_' || c === '~' || c === '=') {
				const runLen = /^(\*+|_+|~+|=+)/.exec(rest)![0].length;
				const prev = src[i - 1] ?? ' ';
				const after = src[i + runLen] ?? ' ';
				const canOpen = !/\s/.test(after) && !(c === '_' && /[\p{L}\p{N}]/u.test(prev));

				if (canOpen) {
					let matched: { node: Inline; end: number } | null = null;

					if ((c === '~' || c === '=') && runLen === 2) {
						const close = findClose(src, i + 2, c + c);
						if (close !== -1) {
							const children = this.inline(src.slice(i + 2, close));
							matched = { node: { type: c === '~' ? 'del' : 'mark', children }, end: close + 2 };
						}
					} else if (c === '*' || c === '_') {
						const tries = runLen >= 3 ? [3, 2, 1] : runLen === 2 ? [2, 1] : [1];
						const contentStart = i + runLen;
						for (const n of tries) {
							const close = findClose(src, contentStart, c.repeat(n));
							if (close === -1) continue;
							const children = this.inline(src.slice(contentStart, close));
							let em: Inline;
							if (n === 3) em = { type: 'strong', children: [{ type: 'em', children }] };
							else if (n === 2) em = { type: 'strong', children };
							else em = { type: 'em', children };
							// leftover opening delimiters become literal text
							if (runLen > n) push(c.repeat(runLen - n), i);
							matched = { node: em, end: close + n };
							break;
						}
					}

					if (matched) {
						node(matched.node);
						i = matched.end;
						continue;
					}
				}

				push(c.repeat(runLen), i);
				i += runLen;
				continue;
			}

			push(c, i);
			i++;
		}

		flush();
		return out;
	}

	/** Parse [label](href "title") or [label][ref] / [label][] / [label] starting at `[`. */
	private linkAt(src: string, start: number): { label: string; href: string; title?: string; end: number } | null {
		// find matching ]
		let depth = 0;
		let j = start;
		for (; j < src.length; j++) {
			const ch = src[j];
			if (ch === '\\') {
				j++;
				continue;
			}
			if (ch === '`') {
				const run = /^`+/.exec(src.slice(j))![0];
				const close = findCodeClose(src, j + run.length, run.length);
				if (close !== -1) j = close + run.length - 1;
				continue;
			}
			if (ch === '[') depth++;
			else if (ch === ']' && --depth === 0) break;
		}
		if (j >= src.length) return null;
		const label = src.slice(start + 1, j);
		let k = j + 1;

		// Inline: (href "title")
		if (src[k] === '(') {
			k++;
			while (src[k] === ' ' || src[k] === '\n') k++;
			let href = '';
			if (src[k] === '<') {
				const close = src.indexOf('>', k);
				if (close === -1) return null;
				href = src.slice(k + 1, close);
				k = close + 1;
			} else {
				let parens = 0;
				while (k < src.length) {
					const ch = src[k];
					if (/\s/.test(ch)) break;
					if (ch === '(') parens++;
					if (ch === ')') {
						if (parens === 0) break;
						parens--;
					}
					href += ch;
					k++;
				}
			}
			while (src[k] === ' ' || src[k] === '\n') k++;
			let title: string | undefined;
			const q = src[k];
			if (q === '"' || q === "'" || q === '(') {
				const endQ = q === '(' ? ')' : q;
				const close = src.indexOf(endQ, k + 1);
				if (close === -1) return null;
				title = src.slice(k + 1, close);
				k = close + 1;
				while (src[k] === ' ') k++;
			}
			if (src[k] !== ')') return null;
			return { label, href: safeUrl(href), title, end: k + 1 };
		}

		// Reference: [label][ref], [label][], [label]
		let ref = label;
		if (src[k] === '[') {
			const close = src.indexOf(']', k);
			if (close !== -1) {
				const inner = src.slice(k + 1, close);
				if (inner) ref = inner;
				k = close + 1;
			}
		}
		const def = this.linkDefs.get(ref.trim().toLowerCase());
		if (!def) return null;
		return { label, href: safeUrl(def.href), title: def.title, end: k };
	}
}

/* =========================================================
   HELPERS
   ========================================================= */

function parseInfo(info: string): { lang: string; title: string | null } {
	const trimmed = info.trim();
	if (!trimmed) return { lang: '', title: null };
	const [lang, ...rest] = trimmed.split(/\s+/);
	const restStr = rest.join(' ');
	const t = /title=["']([^"']+)["']/.exec(restStr);
	return { lang: lang.toLowerCase(), title: t ? t[1] : restStr || null };
}

function splitRow(line: string): string[] {
	let s = line.trim();
	if (s.startsWith('|')) s = s.slice(1);
	if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
	const cells: string[] = [];
	let cur = '';
	let inCode = false;
	for (let i = 0; i < s.length; i++) {
		const ch = s[i];
		if (ch === '\\' && s[i + 1] === '|') {
			cur += '|';
			i++;
		} else if (ch === '`') {
			inCode = !inCode;
			cur += ch;
		} else if (ch === '|' && !inCode) {
			cells.push(cur.trim());
			cur = '';
		} else cur += ch;
	}
	cells.push(cur.trim());
	return cells;
}

function findCodeClose(src: string, from: number, len: number): number {
	let k = from;
	while (k < src.length) {
		const idx = src.indexOf('`', k);
		if (idx === -1) return -1;
		const run = /^`+/.exec(src.slice(idx))![0].length;
		if (run === len) return idx;
		k = idx + run;
	}
	return -1;
}

/** Find a closing emphasis delimiter, skipping code spans and escapes. */
function findClose(src: string, from: number, delim: string): number {
	const ch = delim[0];
	for (let k = from; k < src.length; k++) {
		const c = src[k];
		if (c === '\\') {
			k++;
			continue;
		}
		if (c === '`') {
			const run = /^`+/.exec(src.slice(k))![0].length;
			const close = findCodeClose(src, k + run, run);
			if (close !== -1) k = close + run - 1;
			continue;
		}
		if (c !== ch) continue;

		const runLen = /^(\*+|_+|~+|=+)/.exec(src.slice(k))![0].length;
		const before = src[k - 1] ?? ' ';
		const after = src[k + runLen] ?? ' ';
		const valid = k > from && !/\s/.test(before) && !(ch === '_' && /[\p{L}\p{N}]/u.test(after));

		if (valid && runLen === delim.length) return k;
		// "***" closes both an em and a strong (e.g. *em **strong***) — take the tail
		if (valid && runLen === 3 && delim.length < 3) return k + (3 - delim.length);
		k += runLen - 1;
	}
	return -1;
}

/** Smart quotes, dashes and ellipses — the small details that make text feel set. */
function typography(s: string, prevChar: string | undefined): string {
	const open = /[\s([{—–-]/;
	let out = '';
	for (let i = 0; i < s.length; i++) {
		const c = s[i];
		const prev = i === 0 ? prevChar : s[i - 1];
		if (c === '"') out += prev === undefined || open.test(prev) ? '“' : '”';
		else if (c === "'") out += prev === undefined || open.test(prev) ? '‘' : '’';
		else out += c;
	}
	return out
		.replace(/---/g, '—')
		.replace(/--/g, '–')
		.replace(/\.\.\./g, '…');
}

function isExternal(href: string): boolean {
	return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:');
}

function safeUrl(href: string): string {
	const h = href.trim();
	return /^\s*(javascript|vbscript|data):/i.test(h) && !/^data:image\//i.test(h) ? '#' : h;
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

function truncate(s: string, n: number): string {
	if (s.length <= n) return s;
	const cut = s.slice(0, n);
	return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:\s]+$/, '') + '…';
}

export function inlineText(nodes: Inline[]): string {
	return nodes
		.map((n) => {
			switch (n.type) {
				case 'text':
				case 'code':
				case 'kbd':
					return n.value;
				case 'image':
					return n.alt;
				case 'break':
					return ' ';
				case 'footnoteRef':
					return '';
				default:
					return inlineText(n.children);
			}
		})
		.join('');
}

export function blockText(b: Block): string {
	switch (b.type) {
		case 'heading':
		case 'paragraph':
			return inlineText(b.children);
		case 'figure':
			return b.image.alt;
		case 'blockquote':
		case 'container':
			return b.children.map(blockText).join(' ');
		case 'list':
			return b.items.map((it) => it.children.map(blockText).join(' ')).join(' ');
		case 'table':
			return [...b.head, ...b.rows.flat()].map(inlineText).join(' ');
		case 'code':
			return b.value;
		default:
			return '';
	}
}

/* =========================================================
   PUBLIC API
   ========================================================= */

export function parse(markdown: string): Document {
	return new Parser().parse(markdown);
}

/** Curly quotes, dashes and ellipses for plain strings (titles, descriptions). */
export function smartText(s: string): string {
	return typography(s, undefined);
}
