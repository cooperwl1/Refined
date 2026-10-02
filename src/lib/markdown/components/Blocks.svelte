<script lang="ts">
	import type { Block as BlockNode } from '../ast';
	import Block from './Block.svelte';

	let { blocks, tight = false }: { blocks: BlockNode[]; tight?: boolean } = $props();
</script>

{#each blocks as block, i (i)}
	<Block {block} {tight} />
{/each}
