export interface Entry {
	name: string;
	does: string;
	src: string;
}

export interface Group {
	id: string;
	title: string;
	blurb: string;
	entries: Entry[];
}

export const groups: Group[] = [
	{
		id: 'text',
		title: 'Text',
		blurb: 'The everyday marks. Paragraphs are separated by a blank line.',
		entries: [
			{ name: 'Bold', does: 'Strong emphasis. Use it sparingly.', src: 'This is **bold** text.' },
			{ name: 'Italic', does: 'Light emphasis, titles, foreign words.', src: 'This is *italic* text.' },
			{ name: 'Bold + italic', does: 'Both at once.', src: 'This is ***both***.' },
			{ name: 'Strikethrough', does: 'Marks something as no longer true.', src: 'I ~~loved~~ like fast things.' },
			{ name: 'Highlight', does: 'Underlines an idea in yellow.', src: 'The ==important== part.' },
			{ name: 'Inline code', does: 'Monospace, for names and commands.', src: 'Run `npm run dev` to start.' },
			{ name: 'Keyboard keys', does: 'Draws a little keycap.', src: 'Press <kbd>⌘</kbd> + <kbd>K</kbd>.' },
			{
				name: 'Line break',
				does: 'End a line with a backslash to break without a new paragraph.',
				src: 'First line\\\nSecond line'
			},
			{
				name: 'Smart typography',
				does: 'Quotes curl, dashes and ellipses are typeset for you. Just type plainly.',
				src: '"Quotes" -- en dash, --- em dash, and...'
			}
		]
	},
	{
		id: 'headings',
		title: 'Headings',
		blurb: 'Headings build the page outline and get their own anchor link.',
		entries: [
			{
				name: '# / ## Section',
				does: 'The main heading. Gets an orange square. A single # renders the same as ##.',
				src: '## A section heading'
			},
			{ name: '### Subsection', does: 'A smaller heading inside a section.', src: '### A subsection' },
			{ name: '#### Label', does: 'A small uppercase label. Use for tiny captions.', src: '#### A label' }
		]
	},
	{
		id: 'links',
		title: 'Links & images',
		blurb: 'External links get a small arrow automatically.',
		entries: [
			{
				name: 'Inline link',
				does: 'Text, then the URL. Add a "title" for a tooltip.',
				src: '[Svelte](https://svelte.dev "Svelte")'
			},
			{
				name: 'Reference link',
				does: 'Define the URL once, reuse it by name.',
				src: 'Read the [docs][kit].\n\n[kit]: https://svelte.dev/docs/kit'
			},
			{ name: 'Autolink', does: 'Bare URLs and <angle> URLs become links.', src: 'https://vercel.com or <https://svelte.dev>' },
			{
				name: 'Image',
				does: 'An image alone on its line becomes a figure. The quoted title becomes the caption.',
				src: '![A pen on a desk](/favicon.svg "The pen I keep on my desk.")'
			}
		]
	},
	{
		id: 'lists',
		title: 'Lists',
		blurb: 'Indent two spaces to nest.',
		entries: [
			{
				name: 'Bulleted',
				does: 'Dashes (or * or +).',
				src: '- One\n- Two\n  - Nested\n  - Nested'
			},
			{ name: 'Numbered', does: 'Numbers count themselves, so start any number.', src: '1. First\n2. Second\n3. Third' },
			{ name: 'Task list', does: 'Checkboxes, ticked with an x.', src: '- [x] Done\n- [ ] Not yet' }
		]
	},
	{
		id: 'blocks',
		title: 'Blocks',
		blurb: 'Boxes that change how a passage sits on the page. Open with ::: and close with :::.',
		entries: [
			{ name: 'Blockquote', does: 'Borrowed words. Start each line with >.', src: '> A blockquote, for borrowing someone else\'s words.' },
			{
				name: ':::note',
				does: 'A sidenote. Floats into the margin on wide screens, inline on small ones.',
				src: ':::note\nA **sidenote** in the margin.\n:::'
			},
			{
				name: ':::pullquote',
				does: 'A large quote for the line you want remembered. Text after the keyword is the attribution.',
				src: ':::pullquote Someone wise\nLess, but better.\n:::'
			},
			{
				name: ':::callout',
				does: 'A boxed aside with a title. :::tip, :::info and :::warning work too.',
				src: ':::callout Tip\nCallouts are boxed asides.\n:::'
			},
			{ name: ':::aside', does: 'The quieter version of a callout.', src: ':::aside\nAn aside, softly.\n:::' },
			{ name: ':::wide', does: 'Lets content (a table, an image) break out of the reading column.', src: ':::wide\n| A | B |\n| - | - |\n| 1 | 2 |\n:::' }
		]
	},
	{
		id: 'code',
		title: 'Code',
		blurb: 'Fence with three backticks. Add a language for colour and a title for a filename.',
		entries: [
			{
				name: 'Fenced code',
				does: 'Language after the backticks (js, ts, py, sh, css, html…); title="…" adds a header.',
				src: '```js title="hello.js"\nexport function greet(name) {\n\treturn `Hello, ${name}!`;\n}\n```'
			}
		]
	},
	{
		id: 'tables',
		title: 'Tables',
		blurb: 'Pipes make columns. The second row sets alignment with colons.',
		entries: [
			{
				name: 'Table',
				does: ':-- left, :-: centre, --: right.',
				src: '| Syntax | Result | Align |\n| :-- | :-: | --: |\n| `**bold**` | **bold** | left |\n| `*em*` | *em* | right |'
			}
		]
	},
	{
		id: 'notes',
		title: 'Footnotes & dividers',
		blurb: '',
		entries: [
			{
				name: 'Footnote',
				does: 'Reference in the text, definition anywhere. They collect at the bottom with a link back.',
				src: 'A claim worth sourcing.[^1]\n\n[^1]: Footnotes collect at the bottom.'
			},
			{ name: 'Divider', does: 'Three dashes on their own line.', src: 'Above\n\n---\n\nBelow' }
		]
	}
];

export const tips: { title: string; body: string }[] = [
	{ title: 'Write first, format later', body: 'Get the sentences down in plain paragraphs. Add bold, headings and callouts on a second pass, when you know what matters.' },
	{ title: 'One idea per paragraph', body: 'Leave a blank line between paragraphs. A single line break inside a paragraph is just a space.' },
	{ title: 'Use ## for sections', body: 'Skip # entirely; it renders like ##. Reach for ### only when a section really splits in two.' },
	{ title: 'Emphasis is a seasoning', body: 'If everything is bold, nothing is. Prefer italic for tone and keep bold for the one thing a skimmer must see.' },
	{ title: 'Type plainly', body: 'Use straight quotes and -- or ---. The renderer turns them into proper typography so you never need to hunt for special characters.' },
	{ title: 'Margins over footnotes', body: ':::note keeps an aside next to what it comments on. Use a footnote when it is a citation, a note when it is a thought.' },
	{ title: 'Escape with a backslash', body: 'To show a literal asterisk or bracket, put a backslash before it: \\*not italic\\*.' },
	{ title: 'Code in backticks', body: 'Anything a reader might copy (commands, filenames, keys) belongs in `inline code` or a fenced block.' }
];

export const starter = `## A short test

Write **anything** here and watch it render on the right. Try ==highlights==, \`code\`, and [links](https://svelte.dev).

> Edit me, or clear the box and start fresh.

:::callout Tip
Callouts, notes and pullquotes all work here.
:::

- [x] Read the guide
- [ ] Write something
`;

export interface Field {
	name: string;
	required: boolean;
	does: string;
	example: string;
}

export const fields: Field[] = [
	{ name: 'title', required: true, does: 'The headline. Shown on the page, in lists, and in the browser tab.', example: 'title: The things we choose to keep' },
	{ name: 'date', required: true, does: 'Publish date as YYYY-MM-DD. Posts are sorted newest first. Not needed for pages.', example: 'date: 2026-10-02' },
	{ name: 'description', required: false, does: 'One or two sentences under the title, in lists, RSS and link previews. Defaults to the first paragraph.', example: 'description: A short post about objects.' },
	{ name: 'tags', required: false, does: 'Topics for browsing at /tags. Write [a, b] or a "- item" list. Lowercased and slugified for you.', example: 'tags: [design, attention]' },
	{ name: 'number', required: false, does: 'Pin the entry number. Otherwise posts are numbered automatically, oldest first.', example: 'number: 5' },
	{ name: 'updated', required: false, does: 'Date of the last revision, YYYY-MM-DD.', example: 'updated: 2026-10-10' },
	{ name: 'featured', required: false, does: 'true puts it in the large featured slot on the home page.', example: 'featured: true' },
	{ name: 'draft', required: false, does: 'true hides it on the live site while you work.', example: 'draft: true' },
	{ name: 'slug', required: false, does: 'Custom URL ending. Defaults to the filename (a leading date is dropped).', example: 'slug: custom-url' },
	{ name: 'cover', required: false, does: 'Cover image path. Put images in static/images.', example: 'cover: /images/cover.jpg' },
	{ name: 'coverAlt', required: false, does: 'Describes the cover image for screen readers.', example: 'coverAlt: A pen on a desk' }
];

export const frontmatterExample = `---
title: The things we choose to keep
description: A short post about objects and attention.
date: 2026-10-02
tags: [design, attention]
---

Start writing here. Everything below the second line of dashes is the body.
`;

export const frontmatterNotes = [
	'The header sits at the very top of the file, between two lines of three dashes.',
	'Put a space after each colon. Lines starting with # inside the header are comments.',
	'Files whose names start with _ are ignored, handy for templates and scratch drafts.',
	'The filename becomes the URL: content/posts/on-slowness.md is /posts/on-slowness.',
	'A mistake (bad date, missing title, duplicate URL) stops the build with a clear message, and the live site keeps the last good version.'
];
