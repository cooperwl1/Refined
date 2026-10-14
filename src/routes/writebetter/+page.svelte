<script lang="ts">
	import { onMount } from 'svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { annotationKinds, reviewTypes, type Annotation, type AnnotationKind, type ReviewTypeId } from '$lib/writebetter/reviews';

	type Located = Annotation & { id: number; found: boolean };

	let editor: HTMLDivElement;
	let type = $state<ReviewTypeId>('clarity');
	let settingsOpen = $state(false);
	let loading = $state(false);
	let errorMsg = $state('');
	let items = $state<Located[]>([]);
	let active = $state<number | null>(null);
	let words = $state(0);
	let timer: ReturnType<typeof setTimeout>;
	let paraBlock = $state<HTMLElement | null>(null);
	let paraTop = $state(0);
	const kindLabel = (k: AnnotationKind) => annotationKinds.find((x) => x.id === k)!.label;

	const current = $derived(reviewTypes.find((r) => r.id === type)!);
	const supportsHighlight = typeof CSS !== 'undefined' && 'highlights' in CSS;

	onMount(() => {
		try {
			editor.innerHTML = localStorage.getItem('writebetter:draft') ?? '<p><br></p>';
		} catch {
			editor.innerHTML = '<p><br></p>';
		}
		words = countWords();
		document.addEventListener('selectionchange', trackParagraph);
		return () => document.removeEventListener('selectionchange', trackParagraph);
	});

	function trackParagraph() {
		const sel = document.getSelection();
		let n: Node | null = sel?.anchorNode ?? null;
		if (!n || !editor.contains(n) || n === editor) {
			paraBlock = null;
			return;
		}
		while (n && n.parentNode !== editor) n = n.parentNode;
		const el = n instanceof HTMLElement && n.innerText.trim() ? n : null;
		paraBlock = el;
		if (el) paraTop = el.offsetTop;
	}

	const countWords = () => (editor.innerText.trim().match(/\S+/g) ?? []).length;

	function textNodes() {
		const out: { node: Text; start: number }[] = [];
		const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
		let pos = 0;
		for (let n = walker.nextNode(); n; n = walker.nextNode()) {
			out.push({ node: n as Text, start: pos });
			pos += n.nodeValue!.length;
		}
		return { nodes: out, full: out.map((o) => o.node.nodeValue).join('') };
	}

	function rangeFor(quote: string): Range | null {
		const { nodes, full } = textNodes();
		const at = full.indexOf(quote);
		if (at < 0 || !quote) return null;
		const locate = (offset: number) => {
			for (let i = nodes.length - 1; i >= 0; i--) {
				if (nodes[i].start <= offset) return { node: nodes[i].node, offset: offset - nodes[i].start };
			}
			return null;
		};
		const a = locate(at);
		const b = locate(at + quote.length - 1);
		if (!a || !b) return null;
		const r = document.createRange();
		r.setStart(a.node, a.offset);
		r.setEnd(b.node, b.offset + 1);
		return r;
	}

	function paint() {
		if (!supportsHighlight) return;
		const byKind: Record<AnnotationKind, Range[]> = { insight: [], adjustment: [], idea: [] };
		let activeRange: Range | null = null;
		items = items.map((it) => {
			const r = rangeFor(it.quote);
			if (r) (it.id === active ? (activeRange = r) : byKind[it.kind].push(r));
			return { ...it, found: !!r };
		});
		for (const k of annotationKinds) CSS.highlights.set(`wb-${k.id}`, new Highlight(...byKind[k.id]));
		CSS.highlights.set('wb-active', new Highlight(...(activeRange ? [activeRange] : [])));
	}

	function onInput() {
		words = countWords();
		clearTimeout(timer);
		timer = setTimeout(() => {
			try {
				localStorage.setItem('writebetter:draft', editor.innerHTML);
			} catch {
				/* private mode: skip */
			}
			if (items.length) paint();
		}, 400);
	}

	function onPaste(e: ClipboardEvent) {
		e.preventDefault();
		document.execCommand('insertText', false, e.clipboardData?.getData('text/plain') ?? '');
	}

	function format(cmd: string, value?: string) {
		editor.focus();
		document.execCommand(cmd, false, value);
		onInput();
	}

	async function review(scope?: HTMLElement | null) {
		const text = scope ? scope.innerText : editor.innerText;
		if (!text.trim() || loading) return;
		loading = true;
		errorMsg = '';
		active = null;
		if (scope) {
			// Review just this paragraph: keep notes whose passages sit elsewhere.
			const keep = items.filter((it) => !scope.innerText.includes(it.quote));
			items = keep;
		} else items = [];
		try {
			const res = await fetch('/writebetter/review', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ text, type })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.message ?? 'Review failed.');
			const fresh = data.annotations as Annotation[];
			items = [...items, ...fresh].map((a, id) => ({ ...a, id, found: true }));
			paint();
			if (!fresh.length) errorMsg = 'Nothing worth flagging. Either this is strong, or try another review type.';
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'Review failed.';
		} finally {
			loading = false;
		}
	}

	function focusItem(it: Located) {
		active = it.id;
		paint();
		const r = rangeFor(it.quote);
		r?.startContainer.parentElement?.scrollIntoView({ block: 'center', behavior: 'smooth' });
	}

	function clear() {
		items = [];
		active = null;
		paint();
	}
</script>

<Seo title="Write better" description="Write in a clean editor, then have your prose reviewed: weak passages highlighted and explained." />

<section class="px-page">
	<div class="mx-auto max-w-wide pt-[5vh] pb-20">
		<div class="eyebrow animate-rise">Write better</div>

		<div class="mt-8 flex flex-wrap items-center gap-3 border-b border-line pb-4">
			<div class="flex items-center gap-1 text-[13px] font-semibold" role="toolbar" aria-label="Formatting">
				<button class="tb" onclick={() => format('bold')} aria-label="Bold"><b>B</b></button>
				<button class="tb" onclick={() => format('italic')} aria-label="Italic"><i>I</i></button>
				<button class="tb" onclick={() => format('formatBlock', 'h2')} aria-label="Heading">H</button>
				<button class="tb" onclick={() => format('formatBlock', 'blockquote')} aria-label="Quote">“</button>
				<button class="tb" onclick={() => format('insertUnorderedList')} aria-label="List">•</button>
				<button class="tb" onclick={() => format('formatBlock', 'p')} aria-label="Paragraph">¶</button>
			</div>

			<span class="label ml-auto text-muted">{words} words</span>

			<div class="relative">
				<button class="label border border-line px-4 py-3 hover:border-ink" aria-expanded={settingsOpen} onclick={() => (settingsOpen = !settingsOpen)}>
					Settings · {current.label}
				</button>
				{#if settingsOpen}
					<div class="absolute right-0 z-20 mt-2 w-[min(320px,86vw)] border border-line bg-paper shadow-lg">
						<div class="label border-b border-line px-4 py-3 text-muted">Review type</div>
						{#each reviewTypes as r (r.id)}
							<button
								class="block w-full px-4 py-3 text-left hover:bg-paper-2 {r.id === type ? 'border-l-2 border-orange' : 'border-l-2 border-transparent'}"
								onclick={() => {
									type = r.id;
									settingsOpen = false;
								}}
							>
								<span class="block text-[15px] font-semibold">{r.label}</span>
								<span class="block text-[13px] text-muted">{r.blurb}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<button
				onclick={() => review()}
				disabled={loading}
				class="inline-flex h-12 items-center gap-3 bg-orange px-6 text-[12px] font-bold tracking-[0.08em] text-white uppercase transition-colors hover:bg-ink disabled:opacity-60"
			>
				<span class="size-2 bg-white" aria-hidden="true"></span>
				{loading ? 'Reviewing…' : 'Review Prose'}
			</button>
		</div>

		<div class="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
			<div class="relative max-w-content">
				{#if paraBlock}
					<button
						class="label absolute -top-1 right-0 z-10 translate-y-0 border border-line bg-paper px-3 py-2 hover:border-ink disabled:opacity-60"
						style="top: {paraTop}px"
						disabled={loading}
						onmousedown={(e) => e.preventDefault()}
						onclick={() => review(paraBlock)}
					>
						{loading ? 'Reviewing…' : 'Review paragraph'}
					</button>
				{/if}
			<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
			<div
				bind:this={editor}
				contenteditable="true"
				role="textbox"
				aria-multiline="true"
				aria-label="Your writing"
				tabindex="0"
				spellcheck="true"
				oninput={onInput}
				onpaste={onPaste}
				class="wb-editor min-h-[60vh] outline-none"
			></div>
			</div>

			<aside aria-live="polite" class="lg:sticky lg:top-6 lg:max-h-[calc(100svh-3rem)] lg:self-start lg:overflow-auto">
				{#if errorMsg}
					<p class="border border-line p-4 text-[14px] text-muted">{errorMsg}</p>
				{/if}
				{#if items.length}
					<div class="mb-3 flex items-center justify-between">
						<span class="label text-muted">{items.length} notes · {current.label}</span>
						<button class="label text-muted hover:text-ink" onclick={clear}>Clear</button>
					</div>
					<ul class="grid gap-px border border-line bg-line">
						{#each items as it (it.id)}
							<li class="bg-paper">
								<button
									class="block w-full p-4 text-left {active === it.id ? 'bg-paper-2' : ''} {it.found ? '' : 'opacity-50'}"
									onclick={() => focusItem(it)}
								>
									<span class="label block" style="color: var(--{it.kind === 'insight' ? 'blue' : it.kind === 'idea' ? 'yellow' : 'orange'})">{kindLabel(it.kind)}</span>
									<span class="mt-2 block border-l-2 pl-3 text-[14px] italic" style="border-color: var(--{it.kind === 'insight' ? 'blue' : it.kind === 'idea' ? 'yellow' : 'orange'})">“{it.quote}”</span>
									<span class="mt-3 block text-[14px] leading-[1.55]">{it.issue}</span>
									{#if it.suggestion}
										<span class="mt-2 block text-[13px] leading-[1.5] text-muted">→ {it.suggestion}</span>
									{/if}
									{#if !it.found}<span class="label mt-2 block text-muted">Passage edited</span>{/if}
								</button>
							</li>
						{/each}
					</ul>
				{:else if !errorMsg}
					<p class="text-[14px] leading-[1.6] text-muted">
						Write or paste your draft, then press Review Prose. Weak passages are highlighted and explained here.
					</p>
				{/if}
				{#if !supportsHighlight && items.length}
					<p class="label mt-3 text-muted">Your browser can't highlight inline; notes still list the passages.</p>
				{/if}
			</aside>
		</div>
	</div>
</section>

<style>
	.tb {
		min-width: 36px;
		height: 36px;
		border: 1px solid var(--line);
		padding: 0 8px;
	}
	.tb:hover {
		border-color: var(--ink);
	}
	.wb-editor {
		font-size: 19px;
		line-height: 1.75;
		letter-spacing: -0.01em;
	}
	.wb-editor :global(p),
	.wb-editor :global(div) {
		margin: 0 0 1.2em;
	}
	.wb-editor :global(h2) {
		margin: 1.4em 0 0.5em;
		font-size: 30px;
		font-weight: 600;
		letter-spacing: -0.04em;
		line-height: 1.1;
	}
	.wb-editor :global(blockquote) {
		margin: 0 0 1.2em;
		border-left: 2px solid var(--orange);
		padding-left: 1em;
		color: var(--muted);
	}
	.wb-editor :global(ul) {
		margin: 0 0 1.2em;
		padding-left: 1.4em;
		list-style: disc;
	}
	:global(::highlight(wb-insight)) {
		background: color-mix(in srgb, var(--blue) 26%, transparent);
	}
	:global(::highlight(wb-adjustment)) {
		background: color-mix(in srgb, var(--orange) 28%, transparent);
	}
	:global(::highlight(wb-idea)) {
		background: color-mix(in srgb, var(--yellow) 38%, transparent);
	}
	:global(::highlight(wb-active)) {
		background: color-mix(in srgb, var(--ink) 22%, transparent);
	}
</style>
