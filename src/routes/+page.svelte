<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import PostList from '$lib/components/PostList.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import TagList from '$lib/components/TagList.svelte';
	import { sections, site } from '$lib/config';
	import { formatDate, pad } from '$lib/format';

	let { data } = $props();
</script>

<Seo />

<!-- =======================================================
     HERO
     ======================================================= -->
<section class="px-page">
	<div class="mx-auto flex min-h-[calc(100svh-96px)] max-w-wide flex-col justify-between pt-[9vh] pb-8">
		<div>
			<div class="eyebrow animate-rise">A journal <span class="text-line">/</span> Est. 2026</div>

			<h1
				class="animate-rise mt-10 -ml-[0.06em] text-[clamp(84px,20.5vw,272px)] leading-[0.8] font-semibold tracking-[-0.068em] [animation-delay:80ms]"
			>
				Refined<span class="ml-[0.05em] inline-block size-[0.12em] bg-orange align-baseline" aria-hidden="true"></span>
			</h1>

			<div class="mt-14 grid items-end gap-10 md:mt-20 md:grid-cols-12">
				<p
					class="animate-rise max-w-[620px] text-[clamp(24px,3vw,38px)] leading-[1.14] tracking-[-0.035em] md:col-span-7 [animation-delay:200ms]"
				>
					{site.tagline}
				</p>

				<div class="animate-rise flex flex-wrap gap-3 md:col-span-5 md:justify-self-end [animation-delay:320ms]">
					<Button href="/essays">Start reading</Button>
					<Button href="/about" variant="ghost" arrow={false}>About</Button>
				</div>
			</div>
		</div>

		<div
			class="animate-rise label mt-20 grid grid-cols-2 gap-4 border-t border-line pt-4 text-muted md:grid-cols-3 [animation-delay:440ms]"
		>
			<span>Created by <span class="text-ink">{site.author}</span></span>
			<span class="hidden md:block md:text-center">
				{#each sections as s, i (s.id)}<a href="/{s.id}" class="transition-colors hover:text-ink">{s.label}</a
					>{#if i < sections.length - 1}<span class="mx-2 text-line">·</span>{/if}{/each}
			</span>
			<span class="text-right">{pad(data.total)} entries</span>
		</div>
	</div>
</section>

<!-- =======================================================
     FEATURED
     ======================================================= -->
{#if data.featured}
	{@const f = data.featured}
	<section class="bg-ink px-page text-paper">
		<div class="mx-auto grid max-w-wide gap-12 py-28 md:grid-cols-12 md:py-36">
			<div class="md:col-span-4">
				<div class="eyebrow !text-paper/60">Featured</div>
				<div class="label mt-6 text-paper/60">{pad(f.number)} / {f.sectionLabel}</div>
			</div>
			<a href={f.href} class="group md:col-span-8">
				<h2 class="text-[clamp(40px,6vw,72px)] leading-[0.98] font-semibold tracking-[-0.055em]">
					<span class="bg-[linear-gradient(var(--orange),var(--orange))] bg-[length:0%_3px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:100%_3px]">
						{f.title}
					</span>
				</h2>
				{#if f.description}
					<p class="mt-8 max-w-[570px] text-[20px] leading-[1.5] tracking-[-0.015em] text-paper/65">{f.description}</p>
				{/if}
				<div class="label mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-paper/20 pt-4 text-paper/60">
					<span>{formatDate(f.date)}</span>
					<span>{f.readingTime} min read</span>
					<span class="ml-auto text-orange transition-transform duration-300 group-hover:translate-x-1">Read {f.sectionLabel.slice(0, -1).toLowerCase()} →</span>
				</div>
			</a>
		</div>
	</section>
{/if}

<!-- =======================================================
     LATEST
     ======================================================= -->
{#if data.latest.length}
	<section class="px-page">
		<div class="mx-auto max-w-wide py-28 md:py-36">
			<div class="mb-12 flex items-end justify-between gap-6">
				<h2 class="text-[clamp(36px,4.5vw,52px)] leading-none font-semibold tracking-[-0.05em]">Latest</h2>
				<a href="/essays" class="label text-muted transition-colors hover:text-orange">All writing →</a>
			</div>
			<PostList posts={data.latest} />
		</div>
	</section>
{/if}

<!-- =======================================================
     SECTIONS
     ======================================================= -->
<section class="border-t border-line px-page">
	<div class="mx-auto grid max-w-wide md:grid-cols-3">
		{#each sections as s, i (s.id)}
			<a
				href="/{s.id}"
				class="group flex min-h-[300px] flex-col justify-between border-line py-12 max-md:border-b md:px-10 md:py-16 md:first:pl-0 md:last:pr-0 {i <
				sections.length - 1
					? 'md:border-r'
					: ''}"
			>
				<div class="label flex justify-between text-muted">
					<span>{pad(i + 1)}</span>
					<span>{pad(data.counts[s.id] ?? 0)} entries</span>
				</div>
				<div>
					<h3 class="flex items-center gap-3 text-[40px] leading-none font-semibold tracking-[-0.05em]">
						{s.label}
						<span class="size-2.5 bg-orange opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"></span>
					</h3>
					<p class="mt-4 max-w-[300px] text-[15px] leading-[1.55] text-muted">{s.blurb}</p>
				</div>
			</a>
		{/each}
	</div>
</section>

<!-- =======================================================
     TAGS + CLOSING
     ======================================================= -->
<section class="border-t border-line px-page">
	<div class="mx-auto grid max-w-wide gap-12 py-24 md:grid-cols-12 md:py-32">
		<div class="md:col-span-5">
			<p class="text-[clamp(30px,3.6vw,44px)] leading-[1.05] font-semibold tracking-[-0.045em]">
				{site.motto.charAt(0).toUpperCase() + site.motto.slice(1)}
			</p>
			<p class="mt-5 max-w-[380px] text-[16px] leading-[1.6] text-muted">
				New writing arrives whenever it's ready. Follow along with the <a href="/rss.xml" class="text-ink underline decoration-line underline-offset-4 hover:decoration-orange">RSS feed</a>.
			</p>
		</div>
		{#if data.tags.length}
			<div class="md:col-span-6 md:col-start-7">
				<div class="eyebrow mb-6">Browse by tag</div>
				<TagList tags={data.tags.map((t) => t.tag)} size="md" />
			</div>
		{/if}
	</div>
</section>
