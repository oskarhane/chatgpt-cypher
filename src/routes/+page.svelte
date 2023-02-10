<script lang="ts">
	import type { Driver, Record } from 'neo4j-driver';
	import ConnectModal from '$lib/ConnectModal.svelte';
	import { runQuery } from '$lib/cypher.utils';
	import Table from '$lib/result-views/Table.svelte';
	import { slide } from 'svelte/transition';
	import Generic from '$lib/result-views/Generic.svelte';
	import type { Response, Statuses } from '../types';

	let viewState: 'idle' | 'executing' | 'disconnected' | 'connection-modal' | 'schema-error' =
		'connection-modal';
	let prompt = 'MATCH (n) RETURN n LIMIT 10';
	let schema = '';
	let error = '';
	let driver: Driver | null = null;
	let responses: Response[] = [];
	let id = 0;

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

	async function runPrompt(e: SubmitEvent) {
		e.preventDefault();
		if (!driver) {
			return;
		}
		viewState = 'executing';
		const inputPrompt = prompt;
		const cmd = prompt;

		try {
			const res = await runQuery(driver, prompt);
			const newResponse = {
				id: id++,
				inputPrompt,
				result: res,
				cmd,
				status: 'success' as Statuses['success']
			};
			responses.unshift(newResponse);
			responses = responses;
		} catch (e) {
			const newResponse = {
				id: id++,
				inputPrompt,
				data: (e as Error).message,
				cmd,
				status: 'error' as Statuses['error']
			};
			responses.unshift(newResponse);
			responses = responses;
		} finally {
			viewState = 'idle';
			prompt = '';
		}
	}
	function removeResponse(id: number) {
		responses = responses.filter((r) => r.id !== id);
	}
</script>

<main
	class="grid grid-cols-1 gap-4 place-items-center mt-44 w-11/12 sm:w-3/5 mx-auto min-w-[350px] max-w-[650px]"
>
	<form class=" w-full" on:submit={runPrompt}>
		<div>
			<input
				readonly={viewState === 'executing'}
				placeholder="What insights are you looking for?"
				type="text"
				class="w-full"
				bind:value={prompt}
			/>
		</div>
		<div class="mt-4 flex justify-center">
			<button
				type="submit"
				class="large filled primary w-full sm:w-3/5"
				disabled={viewState === 'executing'}
				>{#if viewState !== 'executing'}Show me{:else}...{/if}</button
			>
		</div>
	</form>
	<stream class="w-full mt-8">
		{#each responses as response (response.id)}
			<div class="response" transition:slide>
				<div class="header">
					<div title={response.cmd} class="cypher">
						{response.cmd}
					</div>
					<button class="close-btn" on:click={() => removeResponse(response.id)}>&times;</button>
				</div>
				<div class="body">
					{#if response.status === 'success'}
						<Table records={response.result.records} />
					{:else}
						<Generic result={response} />
					{/if}
				</div>
			</div>
		{/each}
	</stream>
</main>

<ConnectModal
	open={viewState === 'connection-modal'}
	on:connect={onConnect}
	on:cancel={didCancelConnect}
/>

<style>
	.response {
		margin-top: 14px;
		font-family: monospace;
		font-size: 12px;
		background-color: white;
		overflow: hidden;
		border-radius: 6px;
		border: 1px solid rgb(238 241 246);
	}
	.response .header {
		padding: 16px;
		color: #888;
		font-size: 17px;
		display: flex;
		align-items: center;
		position: relative;
		overflow: hidden;
	}
	.response .header .cypher {
		flex: auto 1 1;
		text-overflow: ellipsis;
		overflow: hidden;
		height: 30px;
		white-space: nowrap;
		border-radius: 6px;
		border: 1px solid rgb(196 200 205);
		line-height: 29px;
		padding: 0 16px;
	}

	.response .header .close-btn {
		font-weight: normal;
		font-family: 'times new roman', times, georgia, serif;
		font-size: 200%;
		color: #888;
		width: 20px;
		height: 20px;
		border: 0;
		padding: 8px;
		margin-left: 16px;
		background: none;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: auto 0 0;
		border-radius: 6px;
		box-sizing: content-box;
	}
	.response .header .close-btn:hover {
		background-color: rgb(230 248 255);
	}
	.response .body {
		white-space: pre;

		max-height: 700px;
		padding: 16px;
		overflow-y: auto;
	}
</style>
