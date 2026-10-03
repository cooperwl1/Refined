import { error } from '@sveltejs/kit';
import { allTags, postsWithTag } from '$lib/server/content';

export function entries() {
	return allTags().map(({ tag }) => ({ tag }));
}

export function load({ params }) {
	const posts = postsWithTag(params.tag);
	if (!posts.length) error(404, 'Not found');
	return { tag: params.tag, posts };
}
