/**
 * Content loader — runs at build time only (server-side, prerendered).
 *
 * Reads every markdown file in /content, parses the frontmatter header and the
 * body with Refined's own markdown parser, and exposes typed helpers to routes.
 * When you push a new .md file to GitHub, Vercel rebuilds and this runs again.
 */
import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import { sections, site } from '$lib/config';
import { normalizeMeta, parseFrontmatter } from '$lib/markdown/frontmatter.js';
import { parse, smartText } from '$lib/markdown/parser';
import type { Post, PostSummary } from '$lib/types';

const files = import.meta.glob('/content/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

function load(): { posts: Post[]; pages: Map<string, Post> } {
	const posts: Post[] = [];
	const pages = new Map<string, Post>();
	const problems: string[] = [];

	for (const [path, raw] of Object.entries(files)) {
		const rel = path.replace(/^\/content\//, '');
		const parts = rel.split('/');
		const folder = parts.length > 1 ? parts[0] : '';
		const isPage = folder === 'pages';
		const basename = parts[parts.length - 1].replace(/\.md$/, '');
		// Files starting with "_" are ignored (templates, scratch).
		if (basename.startsWith('_')) continue;

		const { data, body, errors: fmErrors } = parseFrontmatter(raw);
		const { meta, errors } = normalizeMeta(data, {
			defaultSection: sections.some((s) => s.id === folder) ? folder : undefined,
			isPage
		});
		for (const e of [...fmErrors, ...errors]) problems.push(`content/${rel}: ${e}`);

		// Filenames may start with a date: 2026-10-02-my-post.md -> my-post
		const slug = meta.slug ?? basename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
		const doc = parse(body);
		const section = sections.find((s) => s.id === meta.section);

		const post: Post = {
			slug,
			section: meta.section,
			sectionLabel: section?.label ?? '',
			href: isPage ? `/${slug}` : `/${meta.section}/${slug}`,
			title: smartText(meta.title),
			description: meta.description ? smartText(meta.description) : doc.excerpt,
			date: meta.date,
			updated: meta.updated,
			tags: meta.tags,
			number: meta.number ?? 0,
			featured: meta.featured,
			draft: meta.draft,
			cover: meta.cover,
			coverAlt: meta.coverAlt,
			readingTime: Math.max(1, Math.round(doc.words / site.wordsPerMinute)),
			doc,
			toc: doc.toc,
			file: `content/${rel}`
		};

		if (isPage) pages.set(slug, post);
		else if (!post.draft || dev) posts.push(post);
	}

	if (problems.length) {
		const msg = `\nContent problems:\n  - ${problems.join('\n  - ')}\n`;
		if (dev) console.warn(msg);
		else throw new Error(msg);
	}

	// Auto-number posts within each section (oldest = 01) unless "number" is set.
	for (const s of sections) {
		posts
			.filter((p) => p.section === s.id)
			.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
			.forEach((p, idx) => {
				if (!p.number) p.number = idx + 1;
			});
	}

	posts.sort((a, b) => b.date.localeCompare(a.date) || b.number - a.number);
	return { posts, pages };
}

const { posts, pages } = load();

export function summarize(p: Post): PostSummary {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { doc, toc, file, ...summary } = p;
	return summary;
}

export function allPosts(): PostSummary[] {
	return posts.map(summarize);
}

export function postsInSection(section: string): PostSummary[] {
	return posts.filter((p) => p.section === section).map(summarize);
}

export function getPost(section: string, slug: string) {
	const idx = posts.findIndex((p) => p.section === section && p.slug === slug);
	if (idx === -1) error(404, 'Not found');
	const post = posts[idx];
	const siblings = posts.filter((p) => p.section === section);
	const pos = siblings.indexOf(post);
	const newer = siblings[pos - 1];
	const older = siblings[pos + 1];
	const related = posts
		.filter((p) => p !== post && p.tags.some((t) => post.tags.includes(t)))
		.slice(0, 3)
		.map(summarize);
	return {
		post,
		newer: newer ? summarize(newer) : null,
		older: older ? summarize(older) : null,
		related
	};
}

export function getPage(slug: string): Post {
	const page = pages.get(slug);
	if (!page) error(404, 'Not found');
	return page;
}

export function allTags(): { tag: string; count: number }[] {
	const counts = new Map<string, number>();
	for (const p of posts) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
	return [...counts.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function postsWithTag(tag: string): PostSummary[] {
	return posts.filter((p) => p.tags.includes(tag)).map(summarize);
}

export function sectionCounts(): Record<string, number> {
	return Object.fromEntries(sections.map((s) => [s.id, posts.filter((p) => p.section === s.id).length]));
}

export function siteUrl(): string {
	const host = process.env.PUBLIC_SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
	if (!host) return site.fallbackUrl;
	return (host.startsWith('http') ? host : `https://${host}`).replace(/\/$/, '');
}

/** Raw (full) posts, for the RSS feed. */
export function fullPosts(): Post[] {
	return posts;
}

/** Slugs of standalone pages in content/pages. */
export function pageSlugs(): string[] {
	return [...pages.keys()];
}
