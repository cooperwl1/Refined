<script lang="ts">
	import Markdown from '$lib/markdown/components/Markdown.svelte';
	import ReadingProgress from '$lib/components/ReadingProgress.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import TagList from '$lib/components/TagList.svelte';
	import { formatDate, pad } from '$lib/format';

	let { data } = $props();
	const post = $derived(data.post);
</script>

<Seo title={post.title} description={post.description} type="article" date={post.date} />
<ReadingProgress />

<main class="mx-auto max-w-wide px-page pt-[100px] pb-40 max-[700px]:pt-20 max-[700px]:pb-24">
	<!-- ARTICLE HEADER -->
	<section class="mx-auto w-[680px] max-w-full">
		<div class="eyebrow mb-8">
			{pad(post.number)} / <a href="/{post.section}" class="transition-colors hover:text-ink">{post.sectionLabel}</a>
			{#if post.draft}<span class="text-yellow">· Draft</span>{/if}
		</div>

		<h1 class="text-[clamp(48px,7vw,76px)] leading-[0.98] font-semibold tracking-[-0.055em] max-[700px]:text-[clamp(44px,13vw,64px)]">
			{post.title}
		</h1>

		{#if post.description}
			<p class="mt-[42px] max-w-[570px] text-[20px] leading-[1.5] tracking-[-0.015em] text-muted max-[700px]:text-[18px]">
				{post.description}
			</p>
		{/if}

		<div class="label mt-[42px] flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-muted">
			<time datetime={post.date}>{formatDate(post.date)}</time>
			<span>{post.readingTime} min read</span>
			{#if post.updated}<span>Updated {formatDate(post.updated, 'short')}</span>{/if}
		</div>
	</section>

	{#if post.cover}
		<figure class="mx-auto mt-20 max-w-[1000px]">
			<img src={post.cover} alt={post.coverAlt ?? ''} class="w-full bg-paper-2" />
		</figure>
	{/if}

	<!-- ARTICLE BODY -->
	<div class="mt-[120px] grid grid-cols-[1fr_minmax(0,680px)_1fr] gap-x-12 max-[700px]:mt-20 max-[700px]:block">
		<aside class="hidden pr-4 min-[1240px]:block">
			{#if post.toc.length >= 3}
				<TableOfContents toc={post.toc} />
			{/if}
		</aside>

		<article class="col-start-2 min-w-0">
			<Markdown doc={post.doc} />

			<!-- after the article -->
			<div class="clear-both mt-24 border-t border-line pt-6">
				<div class="flex flex-wrap items-start justify-between gap-6">
					<TagList tags={post.tags} />
					<span class="label text-muted">Filed under <a href="/{post.section}" class="text-ink hover:text-orange">{post.sectionLabel}</a></span>
				</div>
			</div>

			{#if data.older || data.newer}
				<nav class="mt-16 grid gap-px border border-line bg-line sm:grid-cols-2" aria-label="More from {post.sectionLabel}">
					{#if data.older}
						<a href={data.older.href} class="group bg-paper p-6 transition-colors hover:bg-paper-2">
							<span class="label text-muted">← Previous</span>
							<span class="mt-3 block text-[19px] leading-snug font-semibold tracking-[-0.025em] group-hover:text-orange">{data.older.title}</span>
						</a>
					{:else}
						<span class="hidden bg-paper sm:block"></span>
					{/if}
					{#if data.newer}
						<a href={data.newer.href} class="group bg-paper p-6 text-right transition-colors hover:bg-paper-2">
							<span class="label text-muted">Next →</span>
							<span class="mt-3 block text-[19px] leading-snug font-semibold tracking-[-0.025em] group-hover:text-orange">{data.newer.title}</span>
						</a>
					{:else}
						<span class="hidden bg-paper sm:block"></span>
					{/if}
				</nav>
			{/if}

			{#if data.related.length}
				<section class="mt-20">
					<div class="eyebrow mb-6">Related</div>
					<ul class="border-t border-ink">
						{#each data.related as r (r.href)}
							<li class="border-b border-line">
								<a href={r.href} class="group flex items-baseline justify-between gap-6 py-4">
									<span class="text-[17px] font-semibold tracking-[-0.02em] transition-colors group-hover:text-orange">{r.title}</span>
									<span class="label flex-none text-muted">{r.sectionLabel}</span>
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		</article>
	</div>
</main>
