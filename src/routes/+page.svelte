<script lang="ts">
	import type { Driver, Record } from 'neo4j-driver';
	import ConnectModal from '$lib/ConnectModal.svelte';
	import { runQuery } from '$lib/cypher.utils';
	import Table from '$lib/result-views/Table.svelte';
	import Generic from '$lib/result-views/Generic.svelte';
	import type { Response, ResponseError, ResponseSuccess, ResponseText, Statuses } from '../types';
	import Frame from '$lib/Frame.svelte';
	import { runPrompt } from '$lib/run-prompt';

	let viewState: 'idle' | 'executing' | 'disconnected' | 'connection-modal' | 'schema-error' =
		'connection-modal';
	let prompt = '';
	let schema = '';
	let error = '';
	let driver: Driver | null = null;
	let apiToken: string;
	let responses: Response[] = [];
	let metadata: { [key: string]: string } = {};
	let id = 0;

	async function didConnect(newDriver: Driver) {
		error = '';
		driver = newDriver;
		viewState = 'idle';
		const schemaQuery = 'CALL experimental.introspect.asJson({})';
		// get schema from db
		try {
			const res = await runQuery(driver, schemaQuery);
			schema = res.records[0].get(0);
			addResponse({
				status: 'text' as Statuses['text'],
				data: JSON.stringify(JSON.parse(schema), null, 2),
				prompt: '-',
				cypher: schemaQuery
			});
		} catch (e) {
			await driver.close();
			driver = null;
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

	function onConnect({ detail }: { detail: { driver: Driver; chatGPTToken: string } }) {
		apiToken = detail.chatGPTToken;
		didConnect(detail.driver);
	}

	async function run(e: SubmitEvent) {
		e.preventDefault();
		if (!driver) {
			viewState = 'connection-modal';
			return;
		}
		if (!prompt) {
			return;
		}
		let cypher = '';
		try {
			viewState = 'executing';
			const [gptCypher, gptMetadata] = await runPrompt({
				prompt,
				schema,
				token: apiToken,
				metadata
			});
			cypher = gptCypher;
			metadata = gptMetadata;
			const result = await runCypher(cypher);
			addResponse({
				prompt,
				result: result,
				cypher,
				status: 'success' as Statuses['success']
			});
		} catch (e) {
			addResponse({
				prompt,
				data: (e as Error).message,
				cypher,
				status: 'error' as Statuses['error']
			});
		} finally {
			viewState = 'idle';
			prompt = '';
		}
	}

	function addResponse(
		response: Omit<ResponseSuccess, 'id'> | Omit<ResponseError, 'id'> | Omit<ResponseText, 'id'>
	) {
		responses.unshift({ id: id++, ...response } as Response);
		responses = responses;
	}

	async function runCypher(query: string) {
		return await runQuery(driver!, query);
	}

	function removeResponse(id: number) {
		responses = responses.filter((r) => r.id !== id);
	}
</script>

<main
	class="grid grid-cols-1 gap-4 place-items-center mt-44 w-11/12 sm:w-3/5 mx-auto min-w-[350px] max-w-[750px]"
>
	<form class=" w-full" on:submit={run}>
		<div>
			<input
				readonly={viewState === 'executing'}
				placeholder="Using the connected dataset, what do you want to know?"
				type="text"
				class="w-full"
				bind:value={prompt}
			/>
		</div>
		<div class="mt-4 flex justify-center">
			<button
				type="submit"
				class="large filled primary w-full sm:w-3/5"
				disabled={['executing', 'schema-error'].includes(viewState)}
				>{#if viewState !== 'executing'}Show me{:else}...{/if}</button
			>
		</div>
	</form>
	{#if viewState === 'schema-error'}
		<div class="w-full mt-8">
			<Frame
				on:close={() => {
					(error = ''), (viewState = 'connection-modal');
				}}
			>
				<div slot="head">There was an error inferring the db schema</div>
				<div slot="body">
					<pre class="text-red-500">{error}</pre>
				</div>
			</Frame>
		</div>
	{/if}
	<stream class="w-full mt-8 mb-16">
		{#each responses as response (response.id)}
			<Frame on:close={() => removeResponse(response.id)}>
				<div slot="head">
					{#each [{ name: 'Prompt', text: response.prompt }, { name: 'Cypher', text: response.cypher }] as section}
						<details open class="block px-2 mt-2">
							<summary class="text-gray-500 block">{section.name}</summary>
							<pre class="text-xs">{section.text}</pre>
						</details>
					{/each}
				</div>
				<div slot="body">
					{#if response.status === 'success'}
						<Table records={response.result.records} />
					{:else}
						<Generic result={response} />
					{/if}
				</div>
			</Frame>
		{/each}
	</stream>
</main>

<ConnectModal
	open={viewState === 'connection-modal'}
	on:connect={onConnect}
	on:cancel={didCancelConnect}
/>

<style>
	pre {
		white-space: pre-line;
	}
	details > summary::-webkit-details-marker,
	details > summary::marker {
		display: none;
	}
</style>
