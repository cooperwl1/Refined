import type { Document, TocEntry } from '$lib/markdown/ast';

/** Lightweight post info for lists, cards, feeds. */
export interface PostSummary {
	slug: string;
	section: string;
	sectionLabel: string;
	href: string;
	title: string;
	description: string;
	date: string;
	updated: string | null;
	tags: string[];
	number: number;
	featured: boolean;
	draft: boolean;
	cover: string | null;
	coverAlt: string | null;
	readingTime: number;
}

/** A full post: summary + rendered AST. */
export interface Post extends PostSummary {
	doc: Document;
	toc: TocEntry[];
	file: string;
}
