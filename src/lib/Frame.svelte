<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	const dispatch = createEventDispatcher();
</script>

<div class="response" transition:slide>
	<div class="header text-lg text-gray-400 p-4 flex flex-row">
		<div class="p-2 w-full overflow-x-hidden text-sm">
			<slot name="head" />
		</div>
		<button class="close-btn grow-0 shrink-0 w-9" on:click={() => dispatch('close')}>&times;</button
		>
	</div>
	<div class="body">
		<slot name="body" />
	</div>
</div>

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
