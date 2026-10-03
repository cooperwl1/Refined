import { site } from '$lib/config';
import { toHtml } from '$lib/markdown/html';
import { fullPosts, siteUrl } from '$lib/server/content';

export const prerender = true;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function GET() {
	const base = siteUrl();
	const items = fullPosts()
		.filter((p) => !p.draft)
		.slice(0, 30)
		.map(
			(p) => `
		<item>
			<title>${esc(p.title)}</title>
			<link>${base}${p.href}</link>
			<guid isPermaLink="true">${base}${p.href}</guid>
			<pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate>
			<description>${esc(p.description)}</description>
			<content:encoded><![CDATA[${toHtml(p.doc, base).replace(/]]>/g, ']]]]><![CDATA[>')}]]></content:encoded>
			${p.tags.map((t) => `<category>${esc(t)}</category>`).join('')}
		</item>`
		)
		.join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>${esc(site.name)}</title>
		<link>${base}</link>
		<description>${esc(site.tagline)}</description>
		<language>en</language>
		<atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />${items}
	</channel>
</rss>`;

	return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
