# Refined

> Cultivating a lifestyle that allows for deeper meaning.
> — created by Cooper Lappenbusch

A minimal writing site built with **Svelte 5**, **SvelteKit**, **Tailwind CSS v4** and a **hand-written markdown renderer**. Every page is generated from the markdown files in [`content/`](content). To publish, you edit those files on GitHub.

## Pages

- `/writer`: a markdown guide with every supported format, what it does, tips, and a live preview.
- `/` redirects to `/writer`.

The markdown renderer lives in `src/lib/markdown`. The guide's content is in `src/routes/writer/guide.ts`.
