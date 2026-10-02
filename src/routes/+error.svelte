<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head><title>{page.status} — Refined</title></svelte:head>

<main class="mx-auto flex min-h-[60vh] max-w-wide flex-col justify-center px-page py-32">
	<div class="eyebrow mb-8">Error {page.status}</div>
	<h1 class="text-[clamp(56px,10vw,128px)] leading-[0.9] font-semibold tracking-[-0.06em]">
		{page.status === 404 ? 'Nothing here.' : 'Something broke.'}
	</h1>
	<p class="mt-8 max-w-[480px] text-[19px] leading-[1.6] text-muted">
		{page.status === 404
			? "Some things are removed on purpose. This page may have been one of them."
			: page.error?.message}
	</p>
	<div class="mt-12"><Button href="/writer">Go to the writer</Button></div>
</main>
