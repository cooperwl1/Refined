<script lang="ts">
	import PostList from '$lib/components/PostList.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { pad } from '$lib/format';
	import { sections } from '$lib/config';

	let { data } = $props();
	const index = $derived(sections.findIndex((s) => s.id === data.section.id) + 1);
</script>

<Seo title={data.section.label} description={data.section.blurb} />

<main class="mx-auto max-w-wide px-page pt-24 pb-40 max-[700px]:pt-16 max-[700px]:pb-24">
	<header class="grid gap-10 md:grid-cols-12">
		<div class="md:col-span-8">
			<div class="eyebrow mb-8">{pad(index)} / Index</div>
			<h1 class="text-[clamp(56px,9vw,112px)] leading-[0.9] font-semibold tracking-[-0.06em]">{data.section.label}</h1>
		</div>
		<p class="max-w-[360px] self-end text-[18px] leading-[1.5] tracking-[-0.015em] text-muted md:col-span-4 md:justify-self-end">
			{data.section.blurb}
		</p>
	</header>

	<div class="mt-24 max-[700px]:mt-16">
		<div class="label mb-4 flex justify-between text-muted">
			<span>{pad(data.posts.length)} {data.posts.length === 1 ? 'entry' : 'entries'}</span>
			<span>Newest first</span>
		</div>
		{#if data.posts.length}
			<PostList posts={data.posts} showSection={false} />
		{:else}
			<p class="border-t border-ink pt-8 text-[18px] text-muted">Nothing here yet. Soon.</p>
		{/if}
	</div>
</main>
