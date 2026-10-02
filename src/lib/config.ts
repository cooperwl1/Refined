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
		'A guide to writing in markdown on Refined: syntax, tips and a live preview.',
	locale: 'en-US'
} as const;

export const nav = [{ href: '/writer', label: 'Writer' }];
