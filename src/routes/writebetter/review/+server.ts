import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { reviewPrompts } from '$lib/server/review-prompts';
import type { Annotation, ReviewTypeId } from '$lib/writebetter/reviews';

export const prerender = false;

const MAX_CHARS = 20_000;

export async function POST({ request }) {
	const apiKey = env.ANTHROPIC_API_KEY;
	if (!apiKey) error(500, 'ANTHROPIC_API_KEY is not set on the server.');

	const body = await request.json().catch(() => null);
	const text = typeof body?.text === 'string' ? body.text.trim() : '';
	const type = body?.type as ReviewTypeId;
	if (!text) error(400, 'Write something first.');
	if (text.length > MAX_CHARS) error(413, `Too long: keep it under ${MAX_CHARS.toLocaleString()} characters.`);
	if (!(type in reviewPrompts)) error(400, 'Unknown review type.');

	const res = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'x-api-key': apiKey,
			'anthropic-version': '2023-06-01'
		},
		body: JSON.stringify({
			model: env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
			max_tokens: 4096,
			system: reviewPrompts[type],
			messages: [{ role: 'user', content: `<draft>\n${text}\n</draft>` }]
		})
	});

	if (!res.ok) error(502, `Claude API error (${res.status}).`);
	const data = await res.json();
	const raw: string = (data.content ?? []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('');

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1));
	} catch {
		error(502, 'Could not read the review. Try again.');
	}
	const annotations: Annotation[] = (Array.isArray(parsed) ? parsed : [])
		.filter((a) => a && typeof a.quote === 'string' && typeof a.issue === 'string')
		.map((a) => ({ quote: a.quote, issue: a.issue, suggestion: String(a.suggestion ?? '') }));

	return json({ annotations });
}
