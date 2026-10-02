<!-- The primary call to action. Square, orange, with an arrow that leans forward on hover. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		href,
		variant = 'primary',
		arrow = true,
		children
	}: { href: string; variant?: 'primary' | 'ghost'; arrow?: boolean; children: Snippet } = $props();
</script>

<a
	{href}
	class="group/btn relative inline-flex h-13 items-center gap-4 overflow-hidden px-7 text-[12px] font-bold tracking-[0.08em] uppercase transition-colors duration-300
		{variant === 'primary'
		? 'bg-orange text-white hover:text-paper'
		: 'border border-line text-ink hover:border-ink'}"
>
	{#if variant === 'primary'}
		<span
			class="absolute inset-0 -translate-x-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.1,1)] group-hover/btn:translate-x-0"
			aria-hidden="true"
		></span>
	{/if}
	<span class="relative">{@render children()}</span>
	{#if arrow}
		<span class="relative transition-transform duration-300 group-hover/btn:translate-x-1" aria-hidden="true">→</span>
	{/if}
</a>
