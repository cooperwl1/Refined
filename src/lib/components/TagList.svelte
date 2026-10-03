<script lang="ts">
	let { tags, size = 'sm' }: { tags: string[]; size?: 'sm' | 'md' } = $props();
</script>

{#if tags.length}
	<ul class="flex flex-wrap gap-2">
		{#each tags as tag (tag)}
			<li>
				<a
					href="/tags/{tag}"
					class="label inline-flex items-center border border-line text-muted transition-colors hover:border-orange hover:text-orange
						{size === 'md' ? 'px-3.5 py-2' : 'px-2.5 py-1 text-[10px]'}"
				>
					#{tag}
				</a>
			</li>
		{/each}
	</ul>
{/if}
