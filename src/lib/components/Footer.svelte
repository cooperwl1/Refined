<script lang="ts">
	import { site } from '$lib/config';
	const year = new Date().getFullYear();
</script>

<footer class="border-t border-line px-page py-7">
	<div class="label mx-auto flex max-w-wide justify-between gap-3 text-muted max-[700px]:flex-col">
		<span>{site.logo} <span class="mx-1.5 text-line">/</span> © {year} {site.author}</span>
		<span class="flex gap-6">
			<a href="/tags" class="transition-colors hover:text-ink">Tags</a>
			<a href="/rss.xml" class="transition-colors hover:text-ink">RSS</a>
			<span class="text-ink">{site.motto}</span>
		</span>
	</div>
</footer>
