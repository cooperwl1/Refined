import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		// Svelte 5 runes everywhere
		runes: true
	},
	kit: {
		adapter: adapter(),
		alias: {
			$content: 'content'
		},
		prerender: {
			// Every page is generated at build time from the markdown in /content.
			// Pushing to GitHub -> Vercel rebuild -> fresh static site.
			handleHttpError: 'warn',
			handleMissingId: 'warn'
		}
	}
};

export default config;
