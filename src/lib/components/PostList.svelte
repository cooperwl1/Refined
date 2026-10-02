<!-- An index of posts as hairline-ruled rows: number · title & dek · section · date -->
<script lang="ts">
	import type { PostSummary } from '$lib/types';
	import { formatDate, pad } from '$lib/format';

	let { posts, showSection = true }: { posts: PostSummary[]; showSection?: boolean } = $props();
</script>

<ol class="border-t border-ink">
	{#each posts as post (post.href)}
		<li class="border-b border-line">
			<a
				href={post.href}
				class="group grid grid-cols-[48px_1fr] items-baseline gap-x-6 gap-y-2 py-7 md:grid-cols-[64px_1fr_120px_150px] md:gap-x-8"
			>
				<span class="label flex items-center gap-2 text-muted tabular-nums">
					<span class="size-1.5 bg-orange opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>{pad(post.number)}
				</span>
				<span class="min-w-0">
					<span class="block text-[clamp(22px,2.4vw,28px)] leading-[1.12] font-semibold tracking-[-0.035em] transition-transform duration-300 group-hover:translate-x-1">
						{post.title}{#if post.draft}<span class="label ml-3 align-middle text-yellow">Draft</span>{/if}
					</span>
					{#if post.description}
						<span class="mt-2 line-clamp-2 block max-w-[560px] text-[15px] leading-[1.55] text-muted">{post.description}</span>
					{/if}
				</span>
				<span class="label col-start-2 text-muted md:col-start-auto">
					{#if showSection}{post.sectionLabel}{:else}{post.readingTime} min read{/if}
				</span>
				<span class="label col-start-2 text-muted md:col-start-auto md:text-right">{formatDate(post.date)}</span>
			</a>
		</li>
	{/each}
</ol>
