/** Review types shown in the settings menu. Prompts live server-side in $lib/server/review-prompts. */
export const reviewTypes = [
	{ id: 'clarity', label: 'Clarity', blurb: 'Vague claims, muddy sentences, buried points.' },
	{ id: 'argument', label: 'Argument', blurb: 'Weak logic, unsupported claims, gaps in reasoning.' },
	{ id: 'style', label: 'Style', blurb: 'Cliché, filler, passive voice, flabby rhythm.' },
	{ id: 'skeptic', label: 'Hostile reader', blurb: 'The sharpest objections a doubtful reader would raise.' },
	{ id: 'ecl', label: 'Editorial Contrarian Luxury', blurb: 'Prose style: Tom Ford restraint, a contrarian spine, nothing cheap.' },
	{ id: 'iecl', label: 'Instructional Editorial Contrarian Luxury', blurb: 'Prose style: Editorial Contrarian Luxury, but it teaches, in a direct on-camera voice.' }
] as const;

export type ReviewTypeId = (typeof reviewTypes)[number]['id'];

/** insight = a read on the style, adjustment = a fix to make, idea = an exploratory possibility. */
export type AnnotationKind = 'insight' | 'adjustment' | 'idea';

export const annotationKinds: { id: AnnotationKind; label: string }[] = [
	{ id: 'insight', label: 'Insight' },
	{ id: 'adjustment', label: 'Adjustment' },
	{ id: 'idea', label: 'Explorative idea' }
];

export interface Annotation {
	kind: AnnotationKind;
	quote: string;
	issue: string;
	suggestion: string;
}
