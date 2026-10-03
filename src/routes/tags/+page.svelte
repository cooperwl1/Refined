<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { pad } from '$lib/format';

	let { data } = $props();
</script>

<Seo title="Tags" description="Every topic on Refined." />

<main class="mx-auto max-w-wide px-page pt-24 pb-40 max-[700px]:pt-16 max-[700px]:pb-24">
	<div class="eyebrow mb-8">Index</div>
	<h1 class="text-[clamp(56px,9vw,112px)] leading-[0.9] font-semibold tracking-[-0.06em]">Tags</h1>

	<ul class="mt-24 grid border-t border-ink sm:grid-cols-2 lg:grid-cols-3">
		{#each data.tags as { tag, count } (tag)}
			<li class="border-b border-line">
				<a href="/tags/{tag}" class="group flex items-baseline justify-between py-5 pr-6">
					<span class="text-[24px] font-semibold tracking-[-0.035em] transition-colors group-hover:text-orange">#{tag}</span>
					<span class="label text-muted tabular-nums">{pad(count)}</span>
				</a>
			</li>
		{/each}
	</ul>
</main>
