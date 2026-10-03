// Standalone pages from content/pages/*.md (e.g. content/pages/about.md -> /about)
import { getPage, pageSlugs } from '$lib/server/content';

export function entries() {
	return pageSlugs()
		.map((page) => ({ page }));
}

export function load({ params }) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { file, ...page } = getPage(params.page);
	return { page };
}
