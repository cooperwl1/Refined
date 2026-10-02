---
title: A field guide to writing here
description: Every piece of markdown this site understands, in one place — a reference for future me.
date: 2026-09-05
section: notes
tags: [writing, colophon]
---

This site is written in plain markdown files and rendered by a small custom renderer. This note shows everything it understands.

## Text

Paragraphs are separated by a blank line. You can use **bold**, *italic*, ***both***, ~~strikethrough~~, ==highlight==, `inline code`, and keyboard keys like <kbd>⌘</kbd> + <kbd>K</kbd>.

"Straight quotes" become curly ones, two hyphens -- make an en dash, three --- make an em dash, and three dots... become an ellipsis.

Links work [inline](https://svelte.dev "Svelte"), as [references][kit], or bare: https://vercel.com. Footnotes too.[^1]

End a line with a backslash\
to force a line break.

## Lists

- Unordered lists use dashes
- They can nest:
  - like this
  - and this
- [x] Task lists
- [ ] with checkboxes

1. Ordered lists
2. count themselves

## Blocks

> A blockquote, for borrowing someone else's words.

:::note
A **sidenote** floats into the margin on wide screens.
:::

:::pullquote Someone wise
A pullquote, for the line you want readers to remember.
:::

:::callout Tip
Callouts are boxed asides. `:::tip`, `:::info` and `:::warning` work too.
:::

:::aside
An aside is the quieter version.
:::

### Code

```js title="hello.js"
// fenced code with a language and a title
export function greet(name) {
	return `Hello, ${name}!`;
}
```

```bash
npm run new -- essays "My next essay"
```

### Tables

| Syntax | Result | Align |
| :-- | :-: | --: |
| `**bold**` | **bold** | left |
| `*em*` | *em* | right |

### Dividers

Three dashes on their own line make a divider:

---

That's everything.

[kit]: https://svelte.dev/docs/kit
[^1]: Footnotes collect at the bottom of the page and link back.
