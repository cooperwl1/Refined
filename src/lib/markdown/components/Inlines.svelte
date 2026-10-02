<!-- Recursively renders inline nodes: text, emphasis, links, code, images, footnote refs. -->
<script lang="ts">
	import type { Inline } from '../ast';
	import Inlines from './Inlines.svelte';

	let { nodes }: { nodes: Inline[] } = $props();
</script>

{#each nodes as n, i (i)}
	{#if n.type === 'text'}{n.value}{:else if n.type === 'strong'}<strong class="font-semibold"><Inlines nodes={n.children} /></strong>{:else if n.type === 'em'}<em><Inlines nodes={n.children} /></em>{:else if n.type === 'del'}<del class="text-muted decoration-orange/70"><Inlines nodes={n.children} /></del>{:else if n.type === 'mark'}<mark class="bg-yellow/35 text-ink px-[0.15em] -mx-[0.05em]"><Inlines nodes={n.children} /></mark>{:else if n.type === 'code'}<code class="font-mono text-[0.84em] bg-paper-2 border border-line/70 px-[0.35em] py-[0.08em] rounded-[3px]">{n.value}</code>{:else if n.type === 'kbd'}<kbd class="font-sans text-[0.78em] font-semibold border border-line border-b-2 rounded-[4px] px-[0.45em] py-[0.05em] bg-paper-2">{n.value}</kbd>{:else if n.type === 'link'}<a
			href={n.href}
			title={n.title}
			class="md-link"
			target={n.external ? '_blank' : undefined}
			rel={n.external ? 'noopener noreferrer' : undefined}><Inlines nodes={n.children} />{#if n.external}<span class="md-ext" aria-hidden="true">↗</span>{/if}</a
		>{:else if n.type === 'image'}<img src={n.src} alt={n.alt} title={n.title} loading="lazy" class="inline max-h-[1.2em] align-middle" />{:else if n.type === 'footnoteRef'}<sup
			id="fnref-{n.id}"
			class="ml-[1px] scroll-mt-24"><a href="#fn-{n.id}" class="text-orange font-bold text-[0.65em] no-underline" aria-label="Footnote {n.index}">[{n.index}]</a></sup
		>{:else if n.type === 'break'}<br />{/if}
{/each}

<style>
	.md-link {
		text-decoration: underline;
		text-decoration-color: var(--line);
		text-decoration-thickness: 1px;
		text-underline-offset: 0.22em;
		transition:
			text-decoration-color 150ms ease,
			color 150ms ease;
	}
	.md-link:hover {
		text-decoration-color: var(--orange);
		color: var(--orange);
	}
	.md-ext {
		font-size: 0.7em;
		margin-left: 0.12em;
		vertical-align: 0.35em;
		color: var(--muted);
	}
</style>
