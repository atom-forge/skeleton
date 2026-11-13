<script lang="ts">
	import './app.css';
	import { Root } from '@atom-forge/ui';
	import favicon from './(+lib)/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- a Root adja a témát és az overlay-kezelőket (modal, drawer, toast): az egész alkalmazásban egy van belőle -->
<Root>
	{@render children()}
</Root>
