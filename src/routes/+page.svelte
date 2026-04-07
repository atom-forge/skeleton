<script lang="ts">
	import { client } from './client';
	import type { RpcResult } from '@atom-forge/rpc';
	import { Button, Card, Table, type ColumnDef } from '@atom-forge/ui';
	import { RefreshCw } from 'lucide-svelte';

	let { data } = $props();

	type Users = RpcResult<typeof client.user.all>;
	let users = $state<Users>([]);

	let columns: ColumnDef<Users[number]>[] = $state([
		{ key: 'id',        label: 'ID',         shrink: true },
		{ key: 'name',      label: 'Név',         grow: true },
		{ key: 'createdAt', label: 'Létrehozva',  shrink: true, formatter: (row) => new Date(row.createdAt).toLocaleDateString('hu') },
	]);

	async function loadUsers() {
		const res = await client.user.all.$get();
		if (res.isOK()) users = res.result;
	}
</script>

<div class="p-6">
	<Card class="p-4 flex flex-col gap-4">
		<p>Felhasználók száma: {data.userCount}</p>
		<Button label="Felhasználók lekérése" icon={RefreshCw} onclick={loadUsers} />
		<Table data={users} bind:columns />
	</Card>
</div>
