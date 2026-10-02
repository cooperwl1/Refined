<script lang="ts">
	import { highlight } from '../highlight';

	let { lang, title, value }: { lang: string; title: string | null; value: string } = $props();

	const tokens = $derived(highlight(value, lang));
	let copied = $state(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(value);
			copied = true;
			setTimeout(() => (copied = false), 1600);
		} catch {
			/* clipboard unavailable */
		}
	}
</script>

<figure class="code group my-10 md:-mx-8 border border-line bg-paper-2">
	<figcaption class="flex items-center justify-between border-b border-line px-5 py-2.5">
		<span class="eyebrow text-[10px]">{title ?? (lang || 'text')}</span>
		<button
			type="button"
			onclick={copy}
			class="label cursor-pointer text-[10px] text-muted transition-colors hover:text-orange"
			aria-live="polite"
		>
			{copied ? 'Copied' : 'Copy'}
		</button>
	</figcaption>
	<pre class="overflow-x-auto px-5 py-5 font-mono text-[13.5px] leading-[1.7]"><code
			>{#each tokens as t, i (i)}{#if t.type === 'plain'}{t.value}{:else}<span class="tok-{t.type}">{t.value}</span>{/if}{/each}</code
		></pre>
</figure>

<style>
	.tok-keyword {
		color: var(--orange);
	}
	.tok-string {
		color: #5f7d4f;
	}
	.tok-comment {
		color: var(--muted);
		font-style: italic;
	}
	.tok-number {
		color: #b0861b;
	}
	.tok-fn {
		color: var(--ink);
		font-weight: 600;
	}
	.tok-tag {
		color: var(--orange);
	}
	.tok-attr {
		color: #6a6380;
	}
	.tok-punct {
		color: var(--muted);
	}
	@media (prefers-color-scheme: dark) {
		.tok-string {
			color: #9cbf86;
		}
		.tok-number {
			color: var(--yellow);
		}
		.tok-attr {
			color: #b2a8d4;
		}
	}
</style>
