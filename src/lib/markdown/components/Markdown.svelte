<!--
  <Markdown doc={post.doc} />
  The entry point of Refined's renderer: walks the AST from parser.ts and turns
  every node into real Svelte markup. No {@html} anywhere — text is escaped.
-->
<script lang="ts">
	import type { Document } from '../ast';
	import Blocks from './Blocks.svelte';

	let { doc }: { doc: Document } = $props();
</script>

<div class="md">
	<Blocks blocks={doc.children} />

	{#if doc.footnotes.length}
		<section class="mt-24 border-t border-line pt-8" aria-label="Footnotes">
			<h2 class="eyebrow mb-6">Notes</h2>
			<ol class="space-y-3 text-[15px] leading-relaxed text-muted">
				{#each doc.footnotes as fn (fn.id)}
					<li id="fn-{fn.id}" class="flex gap-3 scroll-mt-24">
						<span class="w-6 flex-none text-[11px] font-bold tabular-nums text-orange pt-[3px]">{fn.index}</span>
						<div class="footnote-body min-w-0 flex-1">
							<Blocks blocks={fn.children} tight />
							<a href="#fnref-{fn.id}" class="ml-1 text-orange" aria-label="Back to reference {fn.index}">↩</a>
						</div>
					</li>
				{/each}
			</ol>
		</section>
	{/if}
</div>

<style>
	.footnote-body :global(p) {
		display: inline;
	}
</style>
