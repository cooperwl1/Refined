<!--
  Renders one block-level AST node. Styling follows the "refined" inspiration:
  19px / 1.75 body copy, orange ■ before h2, floating italic sidenotes, hairline rules.
-->
<script lang="ts">
	import type { Block } from '../ast';
	import Blocks from './Blocks.svelte';
	import Inlines from './Inlines.svelte';
	import CodeBlock from './CodeBlock.svelte';

	let { block, tight = false }: { block: Block; tight?: boolean } = $props();
</script>

{#if block.type === 'paragraph'}
	{#if tight}
		<Inlines nodes={block.children} />
	{:else}
		<p class="md-p"><Inlines nodes={block.children} /></p>
	{/if}
{:else if block.type === 'heading'}
	{#if block.level === 1}
		<h2 id={block.id} class="md-h md-h2"><a href="#{block.id}"><Inlines nodes={block.children} /></a></h2>
	{:else if block.level === 2}
		<h2 id={block.id} class="md-h md-h2"><a href="#{block.id}"><Inlines nodes={block.children} /></a></h2>
	{:else if block.level === 3}
		<h3 id={block.id} class="md-h mt-16 mb-5 text-[23px] leading-tight font-semibold tracking-[-0.03em]">
			<a href="#{block.id}"><Inlines nodes={block.children} /></a>
		</h3>
	{:else}
		<h4 id={block.id} class="md-h eyebrow mt-12 mb-4"><Inlines nodes={block.children} /></h4>
	{/if}
{:else if block.type === 'rule'}
	<div class="h-px bg-line mt-24 mb-8" role="separator"></div>
{:else if block.type === 'blockquote'}
	<blockquote class="my-10 border-l-2 border-orange pl-6 text-muted [&_.md-p]:text-[20px] [&_.md-p]:leading-[1.6] [&_.md-p:last-child]:mb-0">
		<Blocks blocks={block.children} />
	</blockquote>
{:else if block.type === 'list'}
	{#if block.ordered}
		<ol start={block.start} class="md-list md-ol {block.tight ? 'is-tight' : ''}">
			{#each block.items as item, i (i)}
				<li><Blocks blocks={item.children} tight={block.tight} /></li>
			{/each}
		</ol>
	{:else}
		<ul class="md-list md-ul {block.tight ? 'is-tight' : ''}">
			{#each block.items as item, i (i)}
				<li class={item.checked !== null ? 'is-task' : ''}>
					{#if item.checked !== null}
						<span class="task-box {item.checked ? 'checked' : ''}" role="img" aria-label={item.checked ? 'Done' : 'Not done'}></span>
					{/if}
					<Blocks blocks={item.children} tight={block.tight} />
				</li>
			{/each}
		</ul>
	{/if}
{:else if block.type === 'code'}
	<CodeBlock lang={block.lang} title={block.title} value={block.value} />
{:else if block.type === 'figure'}
	<figure class="my-14 lg:-mx-12">
		<img src={block.image.src} alt={block.image.alt} loading="lazy" class="w-full h-auto bg-paper-2" />
		{#if block.image.title}
			<figcaption class="mt-3 flex gap-2.5 text-[13px] leading-snug text-muted lg:px-12">
				<span class="mt-[5px] size-1.5 flex-none bg-orange"></span>{block.image.title}
			</figcaption>
		{/if}
	</figure>
{:else if block.type === 'table'}
	<div class="my-12 overflow-x-auto">
		<table class="w-full border-collapse text-[15px] leading-snug">
			<thead>
				<tr class="border-b border-ink">
					{#each block.head as cell, c (c)}
						<th class="label text-muted py-3 pr-6 font-semibold" style:text-align={block.align[c] ?? 'left'}><Inlines nodes={cell} /></th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each block.rows as row, r (r)}
					<tr class="border-b border-line">
						{#each row as cell, c (c)}
							<td class="py-3 pr-6 align-top" style:text-align={block.align[c] ?? 'left'}><Inlines nodes={cell} /></td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else if block.type === 'container'}
	{#if block.kind === 'note'}
		<aside class="sidenote">
			<span class="sidenote-label">{block.title ?? 'Note'}</span>
			<Blocks blocks={block.children} />
		</aside>
	{:else if block.kind === 'pullquote'}
		<figure class="my-20 lg:-mx-16">
			<div class="mb-6 size-2.5 bg-orange"></div>
			<blockquote class="text-[clamp(28px,4vw,40px)] font-semibold leading-[1.12] tracking-[-0.04em] [&_.md-p]:text-[length:inherit] [&_.md-p]:leading-[inherit] [&_.md-p]:tracking-[inherit] [&_.md-p]:mb-0">
				<Blocks blocks={block.children} />
			</blockquote>
			{#if block.title}
				<figcaption class="label mt-6 text-muted">— {block.title}</figcaption>
			{/if}
		</figure>
	{:else if block.kind === 'wide'}
		<div class="my-14 lg:-mx-24 xl:-mx-40">
			<Blocks blocks={block.children} />
		</div>
	{:else}
		<aside class="my-12 px-7 py-6 {block.kind === 'callout' ? 'bg-paper-2 border-l-2 border-orange' : 'border border-line'} [&_.md-p]:text-[16px] [&_.md-p]:leading-[1.65] [&_.md-p:last-child]:mb-0">
			{#if block.title}
				<div class="eyebrow mb-3 text-ink">{block.title}</div>
			{/if}
			<Blocks blocks={block.children} />
		</aside>
	{/if}
{/if}

<style>
	.md-h {
		scroll-margin-top: 96px;
	}
	.md-h a {
		color: inherit;
	}
	.md-h2 {
		margin: 90px 0 30px;
		font-size: 32px;
		line-height: 1.1;
		letter-spacing: -0.04em;
		font-weight: 600;
	}
	.md-h2::before {
		content: '■';
		display: inline-block;
		margin-right: 12px;
		color: var(--orange);
		font-size: 10px;
		vertical-align: 5px;
	}
	@media (max-width: 700px) {
		.md-h2 {
			font-size: 28px;
			margin-top: 72px;
		}
	}

	/* ---------- lists ---------- */
	.md-list {
		margin: 0 0 1.75em;
		padding-left: 1.4em;
		font-size: 19px;
		line-height: 1.75;
		letter-spacing: -0.01em;
	}
	.md-list :global(.md-list) {
		margin: 0.25em 0 0.25em;
		font-size: inherit;
	}
	.md-list > li {
		padding-left: 0.4em;
	}
	.md-list:not(.is-tight) > li {
		margin-bottom: 0.4em;
	}
	.md-list:not(.is-tight) > li :global(.md-p) {
		margin-bottom: 0.6em;
	}
	.md-ul {
		list-style: square;
	}
	.md-ol {
		list-style: decimal;
	}
	.md-ul > li::marker {
		content: '■  ';
		color: var(--orange);
		font-size: 0.5em;
	}
	.md-ol > li::marker {
		color: var(--muted);
		font-size: 0.8em;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	.md-ul > li.is-task::marker {
		content: none;
	}
	.md-ul > li.is-task {
		list-style: none;
		margin-left: -1.4em;
		padding-left: 0;
	}
	.task-box {
		display: inline-block;
		width: 13px;
		height: 13px;
		margin-right: 12px;
		border: 1.5px solid var(--muted);
		vertical-align: -1px;
	}
	.task-box.checked {
		background: var(--orange);
		border-color: var(--orange);
		box-shadow: inset 0 0 0 2px var(--paper);
	}
	@media (max-width: 700px) {
		.md-list {
			font-size: 18px;
		}
	}

	/* ---------- sidenote (from the inspiration) ---------- */
	.sidenote {
		position: relative;
		max-width: 420px;
		margin: 48px 0;
		padding-left: 20px;
		border-left: 1px solid var(--line);
		color: var(--muted);
		font-size: 14px;
		line-height: 1.55;
		font-style: italic;
	}
	.sidenote :global(.md-p) {
		font-size: 14px;
		line-height: 1.55;
		letter-spacing: 0;
		margin-bottom: 0.75em;
	}
	.sidenote :global(.md-p:last-child) {
		margin-bottom: 0;
	}
	.sidenote-label {
		display: block;
		margin-bottom: 8px;
		color: var(--orange);
		font-size: 9px;
		font-weight: 700;
		font-style: normal;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	/* Wide screens: float out into the right margin, like the original design. */
	@media (min-width: 1240px) {
		.sidenote {
			float: right;
			clear: right;
			width: 240px;
			max-width: none;
			margin: 6px calc(-1 * (min(100vw - 2 * var(--page-padding), 1200px) - 680px) / 2 + 24px) 30px 50px;
		}
	}
</style>
