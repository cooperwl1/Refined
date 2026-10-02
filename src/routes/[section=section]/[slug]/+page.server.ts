import { allPosts, getPost } from '$lib/server/content';

export function entries() {
	return allPosts().map((p) => ({ section: p.section, slug: p.slug }));
}

export function load({ params }) {
	const { post, newer, older, related } = getPost(params.section, params.slug);
	// Drop the source path before shipping to the client.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { file, ...rest } = post;
	return { post: rest, newer, older, related };
}
