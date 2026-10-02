import { site } from '$lib/config';

/** "2026-10-02" -> "October 02, 2026" (matches the inspiration's meta row) */
export function formatDate(iso: string, style: 'long' | 'short' = 'long'): string {
	const d = new Date(`${iso}T00:00:00Z`);
	return d.toLocaleDateString(site.locale, {
		timeZone: 'UTC',
		year: 'numeric',
		month: style === 'long' ? 'long' : 'short',
		day: '2-digit'
	});
}

export const pad = (n: number) => String(n).padStart(2, '0');
