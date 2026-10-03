import { allPosts, allTags, sectionCounts } from '$lib/server/content';

export function load() {
	const posts = allPosts();
	const featured = posts.find((p) => p.featured) ?? posts[0] ?? null;
	return {
		featured,
		latest: posts.filter((p) => p !== featured).slice(0, 6),
		counts: sectionCounts(),
		tags: allTags().slice(0, 12),
		total: posts.length
	};
}
