# Refined

> Cultivating a lifestyle that allows for deeper meaning.
> — created by Cooper Lappenbusch

A minimal writing site built with **Svelte 5**, **SvelteKit**, **Tailwind CSS v4** and a **hand-written markdown renderer**. Every page is generated from the markdown files in [`content/`](content). To publish, you edit those files on GitHub.

---

## How publishing works

```
 edit a .md file on github.com  ──►  commit to main  ──►  Vercel builds  ──►  site is live
```

1. Open the repo on GitHub and go to `content/posts`.
2. Click **Add file → Create new file**, or open an existing post and click the ✏️ pencil.
3. Write, then click **Commit changes**.
4. Vercel sees the commit and runs `npm run build`. The build validates every file, parses the markdown and prerenders every page. The site updates in about a minute.

If a file has a problem (a bad date, a missing title, two posts with the same URL), the build stops with a clear message and the live site keeps the last good version. The **Check content** GitHub Action runs the same validation on every push and pull request, so you see a ✗ next to the commit.

### One-time setup

1. **Create a GitHub repo** (for example `refined`) and push this folder:
   ```bash
   git remote add origin https://github.com/<you>/refined.git
   git push -u origin main
   ```
2. **Connect Vercel:** go to [vercel.com/new](https://vercel.com/new), choose **Import Git Repository** and pick the repo. Vercel detects SvelteKit automatically, so keep the defaults and click **Deploy**.
3. *(Optional)* In Vercel → Settings → Environment Variables, set `PUBLIC_SITE_URL` to your custom domain (for example `https://refined.com`) so RSS and sitemap links use it. Without it, the Vercel production URL is used.

That's it. Every push to `main` deploys to production, and every other branch or PR gets its own preview URL.

---

## Writing a post

Create `content/posts/<slug>.md`. The filename becomes the URL: `content/posts/on-slowness.md` → `/posts/on-slowness`.

### The header (frontmatter)

```yaml
---
title: The things we choose to keep          # required
description: A short essay about objects…    # shown under the title, in lists, RSS
date: 2026-10-02                              # required, YYYY-MM-DD
tags: [design, attention]                     # or a "- item" list
number: 4                                     # optional; auto-numbered otherwise
updated: 2026-10-10                           # optional
featured: true                                # optional; the landing page's featured post
draft: true                                   # optional; hidden on the live site, visible in dev
slug: custom-url                              # optional; overrides the filename
cover: /images/cover.jpg                      # optional; images go in static/images
coverAlt: A description of the image
---
```

A copyable template lives at [`content/_template.md`](content/_template.md). Files starting with `_` are ignored. Standalone pages (like About) live in `content/pages/` and are served at `/<filename>`.

### Markdown you can use

| Write | Get |
| :-- | :-- |
| `**bold**` `*italic*` `~~strike~~` `==highlight==` `` `code` `` | inline styles |
| `[text](url)` `[text][ref]` `<https://…>` bare `https://…` | links (external ones get ↗) |
| `![alt](/images/x.jpg "Caption")` on its own line | a figure with a caption |
| `## Heading` / `## Heading {#custom-id}` | anchored headings (h2/h3 build the table of contents) |
| `- item` `1. item` `- [x] done` | lists, nested lists, task lists |
| `> quote` | blockquote |
| ```` ```js title="file.js" ```` | highlighted code with a copy button |
| `\| a \| b \|` + `\|:--\|--:\|` | tables with alignment |
| `---` | the divider rule |
| `text[^1]` + `[^1]: note` | footnotes |
| `:::note` … `:::` | **sidenote** floating in the margin |
| `:::pullquote Attribution` … `:::` | large pull quote |
| `:::callout Title` (or `:::tip`, `:::info`, `:::warning`) | boxed callout |
| `:::aside` / `:::wide` | quiet aside / full-width breakout |
| `<!-- comment -->` | hidden from the site |

Smart quotes, en and em dashes (`--`, `---`) and ellipses (`...`) are applied automatically. The live example is the post **/writer** page.

---

## Local development

```bash
npm install
npm run dev                         # http://localhost:5173 (drafts visible)
npm run new -- "My title"    # scaffold a new draft post
npm run validate                    # check all frontmatter
npm run check                       # type-check
npm run build                       # production build (what Vercel runs)
```

## Project map

```
content/                    ← the only folder you need to touch to publish
  posts/                    ← posts
  pages/about.md            ← standalone pages
src/lib/markdown/
  frontmatter.js            ← header parser + schema (shared with the validator)
  parser.ts                 ← markdown → AST (custom, zero dependencies)
  ast.ts                    ← AST types
  highlight.ts              ← tiny code highlighter
  html.ts                   ← AST → HTML string (used by RSS)
  components/               ← AST → Svelte components (the on-site renderer)
src/lib/server/content.ts   ← loads + indexes all content at build time
src/lib/config.ts           ← site name, tagline, sections, nav
src/routes/                 ← landing, sections, articles, tags, pages, rss.xml, sitemap.xml
src/app.css                 ← Tailwind v4 + design tokens (paper, ink, orange…)
scripts/                    ← validate-content.js, new-post.js
.github/workflows/          ← content check on every push / PR
```

Design tokens (`--paper`, `--ink`, `--muted`, `--line`, `--orange`, `--yellow`) are defined once in `src/app.css`. They're available as Tailwind colors (`bg-paper`, `text-orange`, …) and switch automatically in dark mode.
