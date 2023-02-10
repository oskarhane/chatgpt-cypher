<script lang="ts">
	import { isInt, type QueryResult } from 'neo4j-driver';
	export let result: QueryResult;
	const recordObjs = result.records.reduce<{ keys: PropertyKey[]; rows: string[][] }>(
		(all, r, index) => {
			const keys = r.keys;
			if (index === 0) {
				all.keys = [...keys];
			}
			all.rows.push(keys.map((key) => JSON.stringify(formatValue(r.get(key)), null, 2)));
			return all;
		},
		{ keys: [], rows: [] }
	);
	function formatValue(x: any): any {
		if (isInt(x)) {
			return x.toInt();
		}
		if (Number(x) === x) {
			// Not loving that we get quotes around floats,
			// but it's the only way to differenciate ints from floats
			// without having to write our own JSON.stringify
			return Number.isInteger(x) ? x.toFixed(1) : x;
		}
		if (typeof x === 'string' && !x.startsWith('{')) {
			return x;
		}
		// JSON strings, do not quote
		if (typeof x === 'string') {
			return JSON.parse(x);
		}

		if (x === null) {
			return x;
		}

		if (Array.isArray(x)) {
			return x.map((v) => formatValue(v));
			return x;
		}

		if (typeof x === 'object') {
			let out: Record<string, any> = {};
			Object.keys(x).forEach((key) => {
				out[key] = formatValue(x[key]);
			});
			return out;
		}

		return x;
	}
	function copy(what: string) {
		navigator.clipboard.writeText(what);
	}
</script>

<table>
	<thead
		><tr>
			{#each recordObjs.keys as key}
				<th>
					{key}
				</th>
			{/each}
		</tr></thead
	>
	<tbody>
		{#each recordObjs.rows as row}
			<tr>
				{#each row as col}
					<td><pre>{col}</pre> </td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-spacing: 16px 8px;
		border-collapse: separate;
		text-align: left;
	}
	th {
		border-bottom: 1px solid #ccc;
		font-size: 1rem;
		white-space: normal;
	}

	tr {
		vertical-align: top;
	}

	td {
		white-space: nowrap;
		min-width: 100px;
		position: relative;
		border-bottom: 1px solid #efefef;
	}
	pre {
		background-color: #fafafa;
		border-radius: 6px;
		padding: 8px;
		white-space: pre-wrap;
	}
</style>
