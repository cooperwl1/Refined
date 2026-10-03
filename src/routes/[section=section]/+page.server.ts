import { sections } from '$lib/config';
import { postsInSection } from '$lib/server/content';

export function entries() {
	return sections.map((s) => ({ section: s.id }));
}

export function load({ params }) {
	const section = sections.find((s) => s.id === params.section)!;
	return { section, posts: postsInSection(section.id) };
}
