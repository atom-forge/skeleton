<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Root } from '@atom-forge/ui';
	import { setClientApp } from '$lib/client';
	import { createClientConfig } from '$lib/client/config';

	let { children } = $props();

	setClientApp(createClientConfig());
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Root>
	{@render children()}
</Root>
