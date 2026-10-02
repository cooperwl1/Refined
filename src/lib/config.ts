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
		'Refined is a journal by Cooper Lappenbusch about objects, attention, and cultivating a lifestyle that allows for deeper meaning.',
	/** Used for RSS + sitemap links. Vercel sets VERCEL_PROJECT_PRODUCTION_URL automatically. */
	fallbackUrl: 'https://refined.vercel.app',
	locale: 'en-US',
	wordsPerMinute: 230
} as const;

export const sections = [
	{
		id: 'essays',
		label: 'Essays',
		singular: 'Essay',
		blurb: 'Longer pieces on attention, craft, and the shape of a considered life.'
	},
	{
		id: 'objects',
		label: 'Objects',
		singular: 'Object',
		blurb: 'Things worth keeping — and why they earned their place.'
	},
	{
		id: 'notes',
		label: 'Notes',
		singular: 'Note',
		blurb: 'Short observations, collected as they arrive.'
	}
] as const;

export type SectionId = (typeof sections)[number]['id'];

export const nav = [
	...sections.map((s) => ({ href: `/${s.id}`, label: s.label })),
	{ href: '/about', label: 'About' }
];
