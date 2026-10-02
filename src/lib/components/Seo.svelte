<script lang="ts">
	import { site } from '$lib/config';

	let {
		title,
		description = site.description,
		type = 'website',
		date
	}: { title?: string; description?: string; type?: 'website' | 'article'; date?: string } = $props();

	const full = $derived(title ? `${title} — ${site.name}` : `${site.name} — ${site.tagline}`);
</script>

<svelte:head>
	<title>{full}</title>
	<meta name="description" content={description} />
	<meta name="author" content={site.author} />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={title ?? site.name} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta name="twitter:card" content="summary" />
	{#if date}<meta property="article:published_time" content={date} />{/if}
</svelte:head>
