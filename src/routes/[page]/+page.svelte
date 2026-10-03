<script lang="ts">
	import Markdown from '$lib/markdown/components/Markdown.svelte';
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();
	const page = $derived(data.page);
</script>

<Seo title={page.title} description={page.description} />

<main class="mx-auto max-w-wide px-page pt-[100px] pb-40 max-[700px]:pt-20 max-[700px]:pb-24">
	<section class="mx-auto w-[680px] max-w-full">
		<div class="eyebrow mb-8">{page.title}</div>
		{#if page.description}
			<h1 class="text-[clamp(40px,5.5vw,60px)] leading-[1.02] font-semibold tracking-[-0.05em]">{page.description}</h1>
		{/if}
		<div class="mt-20 border-t border-line pt-16">
			<Markdown doc={page.doc} />
		</div>
	</section>
</main>
