/**
 * Renders the same AST to an HTML string — used for the RSS feed, where
 * Svelte components aren't available. Mirrors the Svelte renderer's structure.
 */
import type { Block, Document, Inline } from './ast';

const esc = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(nodes: Inline[], base: string): string {
	return nodes
		.map((n) => {
			switch (n.type) {
				case 'text':
					return esc(n.value);
				case 'strong':
					return `<strong>${inline(n.children, base)}</strong>`;
				case 'em':
					return `<em>${inline(n.children, base)}</em>`;
				case 'del':
					return `<del>${inline(n.children, base)}</del>`;
				case 'mark':
					return `<mark>${inline(n.children, base)}</mark>`;
				case 'code':
					return `<code>${esc(n.value)}</code>`;
				case 'kbd':
					return `<kbd>${esc(n.value)}</kbd>`;
				case 'link':
					return `<a href="${esc(abs(n.href, base))}">${inline(n.children, base)}</a>`;
				case 'image':
					return `<img src="${esc(abs(n.src, base))}" alt="${esc(n.alt)}">`;
				case 'footnoteRef':
					return `<sup>[${n.index}]</sup>`;
				case 'break':
					return '<br>';
			}
		})
		.join('');
}

function blocks(list: Block[], base: string): string {
	return list.map((b) => block(b, base)).join('\n');
}

function block(b: Block, base: string): string {
	switch (b.type) {
		case 'paragraph':
			return `<p>${inline(b.children, base)}</p>`;
		case 'heading':
			return `<h${b.level}>${inline(b.children, base)}</h${b.level}>`;
		case 'rule':
			return '<hr>';
		case 'blockquote':
			return `<blockquote>${blocks(b.children, base)}</blockquote>`;
		case 'list': {
			const tag = b.ordered ? 'ol' : 'ul';
			const start = b.ordered && b.start !== 1 ? ` start="${b.start}"` : '';
			const items = b.items
				.map((it) => `<li>${it.checked === null ? '' : it.checked ? '☑ ' : '☐ '}${blocks(it.children, base)}</li>`)
				.join('');
			return `<${tag}${start}>${items}</${tag}>`;
		}
		case 'code':
			return `<pre><code>${esc(b.value)}</code></pre>`;
		case 'figure':
			return `<figure><img src="${esc(abs(b.image.src, base))}" alt="${esc(b.image.alt)}">${
				b.image.title ? `<figcaption>${esc(b.image.title)}</figcaption>` : ''
			}</figure>`;
		case 'table': {
			const head = b.head.map((c) => `<th>${inline(c, base)}</th>`).join('');
			const rows = b.rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c, base)}</td>`).join('')}</tr>`).join('');
			return `<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
		}
		case 'container':
			if (b.kind === 'pullquote' || b.kind === 'note') return `<blockquote>${blocks(b.children, base)}</blockquote>`;
			return `<aside>${b.title ? `<strong>${esc(b.title)}</strong>` : ''}${blocks(b.children, base)}</aside>`;
	}
}

function abs(href: string, base: string): string {
	return href.startsWith('/') ? base + href : href;
}

export function toHtml(doc: Document, base = ''): string {
	let out = blocks(doc.children, base);
	if (doc.footnotes.length) {
		out += `<hr><ol>${doc.footnotes.map((f) => `<li>${blocks(f.children, base)}</li>`).join('')}</ol>`;
	}
	return out;
}
