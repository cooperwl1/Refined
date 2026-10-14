/** Review types shown in the settings menu. Prompts live server-side in $lib/server/review-prompts. */
export const reviewTypes = [
	{ id: 'clarity', label: 'Clarity', blurb: 'Vague claims, muddy sentences, buried points.' },
	{ id: 'argument', label: 'Argument', blurb: 'Weak logic, unsupported claims, gaps in reasoning.' },
	{ id: 'style', label: 'Style', blurb: 'Cliché, filler, passive voice, flabby rhythm.' },
	{ id: 'skeptic', label: 'Hostile reader', blurb: 'The sharpest objections a doubtful reader would raise.' }
] as const;

export type ReviewTypeId = (typeof reviewTypes)[number]['id'];

export interface Annotation {
	quote: string;
	issue: string;
	suggestion: string;
}
