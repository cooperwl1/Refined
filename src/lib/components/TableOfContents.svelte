<!-- Sticky contents list in the left margin on wide screens; highlights the section in view. -->
<script lang="ts">
	import type { TocEntry } from '$lib/markdown/ast';

	let { toc }: { toc: TocEntry[] } = $props();
	let active = $state('');

	$effect(() => {
		const els = toc.map((t) => document.getElementById(t.id)).filter((e): e is HTMLElement => !!e);
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) if (e.isIntersecting) active = e.target.id;
			},
			{ rootMargin: '0px 0px -70% 0px' }
		);
		els.forEach((el) => io.observe(el));
		return () => io.disconnect();
	});
</script>

<nav aria-label="Contents" class="sticky top-10">
	<div class="eyebrow mb-5">Contents</div>
	<ol class="space-y-2.5 border-l border-line">
		{#each toc as item (item.id)}
			<li>
				<a
					href="#{item.id}"
					class="-ml-px block border-l-2 text-[13px] leading-snug transition-colors {item.level === 3 ? 'pl-7' : 'pl-4'}
						{active === item.id ? 'border-orange text-ink' : 'border-transparent text-muted hover:text-ink'}">{item.text}</a
				>
			</li>
		{/each}
	</ol>
</nav>
