import type { ReviewTypeId } from '$lib/writebetter/reviews';

const format = `Respond with ONLY a JSON array, no prose, no code fences. Each element:
{"quote": string, "issue": string, "suggestion": string}
- "quote" must be copied EXACTLY, character for character, from the text, and must sit inside a single paragraph. Keep it short: a phrase or one sentence.
- "issue" explains in one to three sentences why this passage is ineffective. Be specific and direct, not polite filler.
- "suggestion" says concretely how to fix it.
Return between 3 and 10 items, most important first. If the text is genuinely strong, return fewer. Return [] if there is nothing worth flagging.`;

const persona = 'You are a demanding, honest writing editor reviewing a draft. You do not flatter. You only flag passages that genuinely weaken the piece.';

export const reviewPrompts: Record<ReviewTypeId, string> = {
	clarity: `${persona}
Focus: clarity. Find vague claims, abstractions with no concrete example, ambiguous references, overloaded sentences, and points buried where the reader will miss them.

${format}`,
	argument: `${persona}
Focus: argument. Find claims without support, leaps in logic, circular reasoning, false dichotomies, undefined terms doing heavy lifting, and conclusions the evidence does not earn.

${format}`,
	style: `${persona}
Focus: prose style. Find clichés, filler words, hedging, needless passive voice, repeated sentence shapes, weak verbs, and rhythm that drags.

${format}`,
	skeptic: `${persona}
Focus: act as a skeptical, hostile-but-fair reader. Flag passages where such a reader would stop trusting the author, raise a strong objection, or feel the writer is dodging. In "issue", state the objection itself.

${format}`,
	ecl: `${persona}
Focus: the prose style "Editorial Contrarian Luxury". Judge the draft against this standard and flag every passage that falls short of it.
The style: a magazine editor with Tom Ford's sensibility. Sleek, deliberate, sensual, severe. Short declarative sentences with the occasional long one that glides. Absolute confidence; no hedging, no apology, no exclamation marks. Taste is stated as fact. Every piece takes a contrarian position, rejecting the consensus view and naming what everyone else gets wrong, and it does so calmly, never with outrage. Diction is exact and tactile: material, cut, finish, restraint, edit, ruthless subtraction. Luxury means precision and omission, not adjectives like "luxurious" or "elegant". Nothing is explained twice.
Flag: generic or committee-sounding phrasing, hedges, enthusiasm, crowd-pleasing consensus takes, filler, decorative adjectives, clutter, and any line that tells instead of asserting a position. In "suggestion", give a sharper rewrite in this voice.

${format}`,
	iecl: `${persona}
Focus: the prose style "Instructional Editorial Contrarian Luxury". Judge the draft against this standard and flag every passage that falls short of it.
The style: Tom Ford's editorial restraint and contrarian authority, fused with the voice of a Cooper Codes YouTube walkthrough. It teaches. It speaks to "you" directly, as if on camera, in plain spoken sentences: "Here's the thing", "Do this first", "Now watch what happens". Steps are concrete and ordered; each one says what to do and why, then moves on. It starts from the conventional advice, rejects it, and shows the better way. Spoken rhythm and short sentences, but still severe, tasteful, and free of hype, filler, and fanboy enthusiasm. No jargon without a one-line definition. Luxury shows in the edit: only the steps that matter, nothing padded.
Flag: instructions that are vague or skip a step, advice that is just the consensus, stiff or academic phrasing, hype and filler, missing "why", padding, and lines that lose the direct voice. In "suggestion", give a sharper rewrite in this voice.

${format}`
};
