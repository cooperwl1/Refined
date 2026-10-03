import { allTags } from '$lib/server/content';

export function load() {
	return { tags: allTags() };
}
