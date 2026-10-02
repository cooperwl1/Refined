import { sections } from '$lib/config';
import { allPosts, allTags, pageSlugs, siteUrl } from '$lib/server/content';

export const prerender = true;

export function GET() {
	const base = siteUrl();
	const pages = pageSlugs();
	const urls: { loc: string; lastmod?: string }[] = [
		{ loc: '/' },
		...sections.map((s) => ({ loc: `/${s.id}` })),
		...pages.map((p) => ({ loc: `/${p}` })),
		{ loc: '/tags' },
		...allTags().map(({ tag }) => ({ loc: `/tags/${tag}` })),
		...allPosts()
			.filter((p) => !p.draft)
			.map((p) => ({ loc: p.href, lastmod: p.updated ?? p.date }))
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `	<url><loc>${base}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>`;

	return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
