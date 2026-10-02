<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<a href="#main" class="label sr-only z-50 bg-orange px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4">Skip to content</a>

<div class="flex min-h-svh flex-col">
	<Header />
	<div id="main" class="flex-1">
		{@render children()}
	</div>
	<Footer />
</div>
