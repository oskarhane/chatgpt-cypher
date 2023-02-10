<script lang="ts">
	import type { Driver } from 'neo4j-driver';
	import ConnectModal from '$lib/ConnectModal.svelte';
	import { runQuery } from '$lib/cypher.utils';

	let viewState: 'idle' | 'executing' | 'disconnected' | 'connection-modal' | 'schema-error' =
		'connection-modal';
	let schema = '';
	let error = '';
	let driver: Driver | null = null;

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

<ConnectModal
	open={viewState === 'connection-modal'}
	on:connect={onConnect}
	on:cancel={didCancelConnect}
/>
