<script lang="ts">
	import { page } from '$app/state';
	import { nav, site } from '$lib/config';

	const isActive = (href: string) => page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	let open = $state(false);

	// close the mobile menu after navigating
	$effect(() => {
		void page.url.pathname;
		open = false;
	});
</script>

<header class="relative z-20 w-full px-page py-8 max-[700px]:py-6">
	<div class="mx-auto flex max-w-wide items-center justify-between">
		<a href="/" class="text-[18px] font-bold tracking-[-0.04em]" aria-label="{site.name} — home">{site.logo}</a>

		<nav class="flex items-center gap-7 text-[12px] font-semibold tracking-[0.04em] uppercase max-[700px]:hidden" aria-label="Main">
			{#each nav as item (item.href)}
				<a
					href={item.href}
					class="nav-link text-muted transition-colors duration-150 hover:text-ink {isActive(item.href) ? 'active' : ''}"
					aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</a
				>
			{/each}
		</nav>

		<button
			type="button"
			class="label hidden cursor-pointer items-center gap-2 max-[700px]:flex"
			aria-expanded={open}
			aria-controls="mobile-nav"
			onclick={() => (open = !open)}
		>
			<span class="size-2 bg-orange transition-transform duration-300 {open ? 'rotate-45' : ''}"></span>
			{open ? 'Close' : 'Menu'}
		</button>
	</div>

	{#if open}
		<nav id="mobile-nav" class="mx-auto mt-8 flex max-w-wide flex-col border-t border-line min-[701px]:hidden" aria-label="Mobile">
			{#each nav as item (item.href)}
				<a
					href={item.href}
					class="flex items-center justify-between border-b border-line py-4 text-[28px] font-semibold tracking-[-0.04em]"
					aria-current={isActive(item.href) ? 'page' : undefined}
				>
					{item.label}
					{#if isActive(item.href)}<span class="size-2 bg-orange"></span>{/if}
				</a>
			{/each}
		</nav>
	{/if}
</header>

<style>
	.nav-link.active {
		color: var(--ink);
	}
	.nav-link.active::before {
		content: '●';
		color: var(--orange);
		font-size: 8px;
		margin-right: 7px;
		vertical-align: 2px;
	}
</style>
