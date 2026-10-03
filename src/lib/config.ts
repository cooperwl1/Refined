/**
 * Site-wide settings. Change these and push — the site rebuilds on Vercel.
 */
export const site = {
	name: 'Refined',
	logo: 'refined',
	tagline: 'Cultivating a lifestyle that allows for deeper meaning.',
	author: 'Cooper Lappenbusch',
	motto: 'less, but better.',
	description:
		'Refined is a journal by Cooper Lappenbusch about attention, craft, and cultivating a lifestyle that allows for deeper meaning.',
	/** Used for RSS + sitemap links. Vercel sets VERCEL_PROJECT_PRODUCTION_URL automatically. */
	fallbackUrl: 'https://refined.vercel.app',
	locale: 'en-US',
	wordsPerMinute: 230
} as const;

export const sections = [
	{
		id: 'posts',
		label: 'Posts',
		singular: 'Post',
		blurb: 'Writing on attention, craft, objects, and the shape of a considered life.'
	}
] as const;

export type SectionId = (typeof sections)[number]['id'];

export const nav = [
	...sections.map((s) => ({ href: `/${s.id}`, label: s.label })),
	{ href: '/about', label: 'About' },
	{ href: '/writer', label: 'Writer' }
];
