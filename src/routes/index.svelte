<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ fetch }) => {
		const res = await fetch('/index.json');

		if (res.ok) {
			const json = await res.json();
			// console.log(json);

			const _repos = await json.repos;
			// console.log(_repos);

			return {
				props: { repos: _repos }
			};
		}

		const { message } = await res.json();

		return {
			error: new Error(message)
		};
	};
</script>

<script lang="ts">
	export let repos;
	// console.log(repos);
</script>

<table>
	<tr>
		<th>Repo</th>
		<th>Github Actions</th>
		<th>Circle CI</th>
	</tr>
	{#each repos as repo}
		<tr>
			<th>{repo}</th>
			<th>...</th>
			<th>...</th>
		</tr>
	{/each}
</table>
