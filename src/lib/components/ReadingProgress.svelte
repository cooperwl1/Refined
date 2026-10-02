<!-- A hairline of orange across the top of the page that fills as you read. -->
<script lang="ts">
	let progress = $state(0);

	function update() {
		const el = document.documentElement;
		const max = el.scrollHeight - el.clientHeight;
		progress = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
	}

	$effect(() => {
		update();
	});
</script>

<svelte:window onscroll={update} onresize={update} />

<div class="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]" aria-hidden="true">
	<div class="h-full origin-left bg-orange" style:transform="scaleX({progress})"></div>
</div>
