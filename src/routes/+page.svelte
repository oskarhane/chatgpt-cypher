<script lang="ts">
	import type { Driver, QueryResult } from 'neo4j-driver';
	import ConnectModal from '$lib/ConnectModal.svelte';
	import { runQuery } from '$lib/cypher.utils';

	let viewState: 'idle' | 'executing' | 'disconnected' | 'connection-modal' | 'schema-error' =
		'idle';
	let prompt = '';
	let schema = '';
	let error = '';
	let driver: Driver | null = null;
	let results: QueryResult[] = Array.from({ length: 10 }, () => ({} as QueryResult));

	async function didConnect(newDriver: Driver) {
		driver = newDriver;
		viewState = 'idle';
		// get schema from db
		try {
			const res = await runQuery(driver, 'CALL experimental.introspect.asJson({})');
			schema = res.records[0].get(0);
		} catch (e) {
			error = (e as Error).message;
			viewState = 'schema-error';
		}
	}
	function didCancelConnect() {
		if (!driver) {
			viewState = 'disconnected';
		} else {
			viewState = 'idle';
		}
	}
	function onConnect({ detail }: { detail: { driver: Driver } }) {
		didConnect(detail.driver);
	}
</script>

<main
	class="grid grid-cols-1 gap-4 place-items-center mt-44 w-11/12 sm:w-3/5 mx-auto min-w-[350px] max-w-[650px]"
>
	<div class=" w-full">
		<div>
			<input
				placeholder="What insights are you looking for?"
				type="text"
				class="w-full"
				bind:value={prompt}
			/>
		</div>
		<div class="mt-4 flex justify-center">
			<button class="large filled primary w-full sm:w-3/5">Show me</button>
		</div>
	</div>
	<stream class="w-full mt-8">
		{#each results as res}
			<div class="h-48 border border-red-600">hello</div>
		{/each}
	</stream>
</main>

<ConnectModal
	open={viewState === 'connection-modal'}
	on:connect={onConnect}
	on:cancel={didCancelConnect}
/>

<style>
</style>
