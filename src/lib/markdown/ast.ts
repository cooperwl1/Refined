/**
 * The markdown AST produced by `parse()` and consumed by `<Markdown />`.
 * Every node is plain JSON so it can be prerendered and shipped to the client.
 */

/* ---------- Inline ---------- */

export type Inline =
	| { type: 'text'; value: string }
	| { type: 'strong'; children: Inline[] }
	| { type: 'em'; children: Inline[] }
	| { type: 'del'; children: Inline[] }
	| { type: 'mark'; children: Inline[] }
	| { type: 'code'; value: string }
	| { type: 'kbd'; value: string }
	| { type: 'link'; href: string; title?: string; external: boolean; children: Inline[] }
	| { type: 'image'; src: string; alt: string; title?: string }
	| { type: 'footnoteRef'; id: string; index: number }
	| { type: 'break' };

/* ---------- Blocks ---------- */

export type ContainerKind = 'note' | 'pullquote' | 'callout' | 'aside' | 'wide';

export type Align = 'left' | 'center' | 'right' | null;

export interface ListItem {
	checked: boolean | null;
	children: Block[];
}

export type Block =
	| { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; id: string; text: string; children: Inline[] }
	| { type: 'paragraph'; children: Inline[] }
	| { type: 'figure'; image: Extract<Inline, { type: 'image' }> }
	| { type: 'blockquote'; children: Block[] }
	| { type: 'list'; ordered: boolean; start: number; tight: boolean; items: ListItem[] }
	| { type: 'code'; lang: string; title: string | null; value: string }
	| { type: 'rule' }
	| { type: 'table'; align: Align[]; head: Inline[][]; rows: Inline[][][] }
	| { type: 'container'; kind: ContainerKind; title: string | null; children: Block[] };

export interface Footnote {
	id: string;
	index: number;
	children: Block[];
}

export interface TocEntry {
	id: string;
	text: string;
	level: number;
}

export interface Document {
	children: Block[];
	footnotes: Footnote[];
	toc: TocEntry[];
	words: number;
	/** First paragraph as plain text — used as a fallback description. */
	excerpt: string;
}
