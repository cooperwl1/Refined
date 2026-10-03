import type { ParamMatcher } from '@sveltejs/kit';
import { sections } from '$lib/config';

export const match = ((param: string) => sections.some((s) => s.id === param)) satisfies ParamMatcher;
