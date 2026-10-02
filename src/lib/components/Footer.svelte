<script lang="ts">
	import { site } from '$lib/config';
	const year = new Date().getFullYear();
</script>

<footer class="border-t border-line px-page py-7">
	<div class="label mx-auto flex max-w-wide justify-between gap-3 text-muted max-[700px]:flex-col">
		<span>{site.logo} <span class="mx-1.5 text-line">/</span> © {year} {site.author}</span>
		<span class="text-ink">{site.motto}</span>
	</div>
</footer>
