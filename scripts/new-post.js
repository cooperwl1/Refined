#!/usr/bin/env node
// Usage: npm run new -- "The title of my post"
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { slugify } from '../src/lib/markdown/frontmatter.js';

const section = 'posts';
const title = process.argv.slice(2).join(' ') || 'Untitled';

const date = new Date().toISOString().slice(0, 10);
const file = `content/${section}/${slugify(title)}.md`;
if (existsSync(file)) {
	console.error(`${file} already exists.`);
	process.exit(1);
}

mkdirSync(`content/${section}`, { recursive: true });
writeFileSync(
	file,
	`---
title: ${title}
description:
date: ${date}
section: ${section}
tags: []
draft: true
---

Start writing.
`
);
console.log(`Created ${file} (as a draft — set draft: false to publish).`);
