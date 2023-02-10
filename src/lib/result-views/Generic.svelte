<script lang="ts">
	export let result: { data: string };
</script>

<p>{result.data}</p>

<style>
	p {
		background-color: #fafafa;
		font-size: 1rem;
		padding: 8px;
		border-radius: 6px;
		overflow: auto;
	}
</style>
