<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Markdown from '$lib/markdown/components/Markdown.svelte';
	import { parse } from '$lib/markdown/parser';
	import { groups, starter, tips } from './guide';

	let text = $state(starter);
	const live = $derived(parse(text));
	const rendered = groups.map((g) => ({ ...g, entries: g.entries.map((e) => ({ ...e, doc: parse(e.src) })) }));
</script>

<Seo title="Writer" description="How to write in markdown on Refined: every format, what it does, and a live preview." />

<section class="px-page">
	<div class="mx-auto max-w-wide pt-[6vh] pb-20">
		<div class="eyebrow animate-rise">Writer <span class="text-line">/</span> Markdown guide</div>
		<h1 class="animate-rise mt-8 text-[clamp(56px,11vw,150px)] leading-[0.85] font-semibold tracking-[-0.06em] [animation-delay:80ms]">
			Write plainly<span class="ml-[0.05em] inline-block size-[0.12em] bg-orange align-baseline" aria-hidden="true"></span>
		</h1>
		<p class="animate-rise mt-10 max-w-[620px] text-[clamp(20px,2.4vw,28px)] leading-[1.2] tracking-[-0.03em] [animation-delay:200ms]">
			Markdown is text with a few light marks. This is every one of them, what it does, and a place to try it.
		</p>
		<nav class="label mt-10 flex flex-wrap gap-x-5 gap-y-2 text-muted" aria-label="Guide sections">
			<a href="#try" class="hover:text-ink">Try it</a>
			{#each groups as g (g.id)}<a href="#{g.id}" class="hover:text-ink">{g.title}</a>{/each}
			<a href="#tips" class="hover:text-ink">Tips</a>
		</nav>
	</div>
</section>

<section id="try" class="scroll-mt-8 border-t border-line px-page">
	<div class="mx-auto max-w-wide py-16 md:py-24">
		<h2 class="mb-8 text-[clamp(30px,4vw,44px)] leading-none font-semibold tracking-[-0.05em]">Try it</h2>
		<div class="grid gap-px border border-line bg-line md:grid-cols-2">
			<div class="bg-paper">
				<label for="editor" class="label block border-b border-line px-5 py-3 text-muted">Markdown</label>
				<textarea
					id="editor"
					bind:value={text}
					spellcheck="false"
					class="block h-[480px] w-full resize-y bg-transparent p-5 font-mono text-[14px] leading-[1.7] outline-none focus:bg-paper-2"
				></textarea>
			</div>
			<div class="bg-paper">
				<div class="label border-b border-line px-5 py-3 text-muted">Preview</div>
				<div class="preview h-[480px] overflow-auto p-5"><Markdown doc={live} /></div>
			</div>
		</div>
	</div>
</section>

{#each rendered as g (g.id)}
	<section id={g.id} class="scroll-mt-8 border-t border-line px-page">
		<div class="mx-auto max-w-wide py-16 md:py-24">
			<h2 class="text-[clamp(30px,4vw,44px)] leading-none font-semibold tracking-[-0.05em]">{g.title}</h2>
			{#if g.blurb}<p class="mt-4 max-w-[520px] text-[16px] leading-[1.6] text-muted">{g.blurb}</p>{/if}

			<div class="mt-10 border-t border-ink">
				{#each g.entries as e (e.name)}
					<div class="grid gap-6 border-b border-line py-8 md:grid-cols-12">
						<div class="md:col-span-4">
							<h3 class="text-[18px] font-semibold tracking-[-0.02em]">{e.name}</h3>
							<p class="mt-2 text-[15px] leading-[1.55] text-muted">{e.does}</p>
						</div>
						<div class="min-w-0 md:col-span-4">
							<div class="label mb-2 text-muted">You type</div>
							<pre class="overflow-x-auto bg-paper-2 p-4 font-mono text-[13px] leading-[1.7] whitespace-pre">{e.src}</pre>
						</div>
						<div class="min-w-0 md:col-span-4">
							<div class="label mb-2 text-muted">You get</div>
							<div class="preview"><Markdown doc={e.doc} /></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/each}

<section id="tips" class="scroll-mt-8 border-t border-line px-page">
	<div class="mx-auto max-w-wide py-16 md:py-24">
		<h2 class="mb-10 text-[clamp(30px,4vw,44px)] leading-none font-semibold tracking-[-0.05em]">Tips &amp; tricks</h2>
		<ol class="grid gap-x-12 gap-y-10 md:grid-cols-2">
			{#each tips as t, i (t.title)}
				<li class="flex gap-5 border-t border-line pt-5">
					<span class="label w-6 flex-none pt-0.5 text-orange tabular-nums">{String(i + 1).padStart(2, '0')}</span>
					<div>
						<h3 class="text-[18px] font-semibold tracking-[-0.02em]">{t.title}</h3>
						<p class="mt-2 text-[15px] leading-[1.6] text-muted">{t.body}</p>
					</div>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	.preview {
		overflow-x: clip;
	}
	.preview :global([class*='-mx-']) {
		margin-left: 0;
		margin-right: 0;
	}
	.preview :global(.md > :first-child) {
		margin-top: 0;
	}
	.preview :global(.md-p) {
		font-size: 17px;
		line-height: 1.6;
		margin-bottom: 0;
	}
</style>
