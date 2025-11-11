<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.scss';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { supabaseClient } from '$lib/supabase';

	let { children } = $props();

	onMount(() => {
		const { data: { subscription }} = supabaseClient.auth.onAuthStateChange(() => {
			invalidateAll();
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div id="app">
	{@render children()}
</div>
