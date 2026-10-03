<script lang="ts">
	import PostList from '$lib/components/PostList.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { pad } from '$lib/format';

	let { data } = $props();
</script>

<Seo title="#{data.tag}" description="Writing tagged {data.tag} on Refined." />

<main class="mx-auto max-w-wide px-page pt-24 pb-40 max-[700px]:pt-16 max-[700px]:pb-24">
	<div class="eyebrow mb-8"><a href="/tags" class="hover:text-ink">Tags</a></div>
	<h1 class="text-[clamp(56px,9vw,112px)] leading-[0.9] font-semibold tracking-[-0.06em]">
		<span class="text-orange">#</span>{data.tag}
	</h1>
	<div class="mt-24">
		<div class="label mb-4 text-muted">{pad(data.posts.length)} {data.posts.length === 1 ? 'entry' : 'entries'}</div>
		<PostList posts={data.posts} />
	</div>
</main>
