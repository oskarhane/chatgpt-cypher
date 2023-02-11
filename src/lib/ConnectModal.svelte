<script lang="ts">
	import type { Driver } from 'neo4j-driver';
	import { onMount, createEventDispatcher, onDestroy } from 'svelte';
	import { connect } from './cypher.utils';

	export let open: boolean = true;

	let error: string = '';
	let dialog: HTMLDialogElement;
	let passwordElement: HTMLInputElement;
	let connectURL = 'neo4j://localhost:7687';
	let username = 'neo4j';
	let password = '';
	let chatGPTToken = '';
	let dispatch = createEventDispatcher();
	let driver: Driver;

	$: toggleModal(open);

	onMount(() => {
		dialog.addEventListener('close', dialogCloseHandler);
		dialog.addEventListener('keydown', keyDownHandler);
	});
	onDestroy(() => {
		if (dialog) {
			dialog.removeEventListener('keydown', keyDownHandler);
			dialog.removeEventListener('close', dialogCloseHandler);
		}
		if (driver) {
			driver.close();
		}
	});

	function keyDownHandler(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			dialog.close('cancel');
		}
	}

	function dialogCloseHandler() {
		error = '';
		open = false;
		if (dialog.returnValue === 'connect') {
			connectAndSetState();
		} else {
			resetForm();
			dispatch('cancel');
		}
	}

	async function connectAndSetState() {
		if (driver) {
			driver.close();
		}
		try {
			driver = await connect({ connectURL, username, password });
			dispatch('connect', { driver, chatGPTToken });
			resetForm();
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			console.log(`Couldn't connect ${message}`);
			error = message;
			open = true;
		}
	}
	function resetForm() {
		error = '';
		password = '';
		chatGPTToken = '';
	}

	function toggleModal(show: boolean) {
		if (!dialog) {
			setTimeout(() => toggleModal(show), 100);
			return;
		}
		if (show && !dialog.open) {
			dialog.showModal();
			if (passwordElement) {
				passwordElement.focus();
			}
		}
	}
</script>

<dialog bind:this={dialog}>
	<h3 class="text-center text-md">Connect to Neo4j</h3>
	<form method="dialog">
		<label class="mt-2">
			<span>Connection URL</span>
			<input
				class="w-full"
				type="text"
				placeholder="neo4j://localhost:7687"
				bind:value={connectURL}
			/>
		</label>
		<div class="split">
			<label>
				<span>Database user</span>
				<input type="text" placeholder="neo4j" bind:value={username} />
			</label>
			<label>
				<span>Database password</span>
				<input bind:this={passwordElement} type="password" bind:value={password} />
			</label>
		</div>
		<div class="mt-8 mb-0">
			<h3 class="text-center text-md">OpenAI API Key</h3>
			<label class="mt-2">
				<span
					>API Key (<a
						class="underline text-xs"
						href="https://platform.openai.com/account/api-keys"
						rel="noreferrer"
						target="_blank">found here</a
					>)</span
				>
				<input class="w-full" type="text" bind:value={chatGPTToken} />
			</label>
		</div>
		{#if error.length}
			<div class="error">
				{error}
			</div>
		{/if}
		<div class="actions">
			<button class="large filled primary" value="connect">Connect</button>
			<button class="large text primary" value="cancel">Cancel</button>
		</div>
	</form>
</dialog>

<style>
	.error {
		margin-top: 2rem;
		background-color: pink;
		color: red;
		padding: 16px;
		border-radius: 6px;
	}
	.actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 4.5rem;
		gap: 1rem;
	}
	.w-full {
		width: 100%;
	}
	.split {
		width: 100%;
		display: flex;
		justify-content: space-between;
	}
	.split label {
		width: 45%;
	}
	dialog {
		border-radius: 16px;
		width: 500px;
		border: 0;
		padding: 3rem 2rem;
	}
</style>
