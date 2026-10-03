#!/usr/bin/env node
// Usage: npm run new -- essays "The title of my essay"
import { existsSync, writeFileSync } from 'node:fs';
import { SECTIONS, slugify } from '../src/lib/markdown/frontmatter.js';

const [section = 'essays', ...titleParts] = process.argv.slice(2);
const title = titleParts.join(' ') || 'Untitled';

if (!(/** @type {readonly string[]} */ (SECTIONS)).includes(section)) {
	console.error(`Section must be one of: ${SECTIONS.join(', ')}`);
	process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const file = `content/${section}/${slugify(title)}.md`;
if (existsSync(file)) {
	console.error(`${file} already exists.`);
	process.exit(1);
}

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
