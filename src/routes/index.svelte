<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ fetch }) => {
		const res = await fetch('/index.json');

		if (res.ok) {
			const json = await res.json();
			const repos = await json.repos;
			return {
				props: { repos }
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
			<th><a href="https://github.com/{repo}">{repo}</a></th>
			<th>...</th>
			<th>
				<a href="https://circleci.com/gh/{repo}">
					<img
						src="https://circleci.com/gh/{repo}.svg?style=svg"
						alt="CircleCI build status for {repo}"
						onError="this.parentElement.href = 'https://circleci.com/add-projects'; this.src = 'images/circle-ci-no-builds.svg'"
					/>
				</a>
			</th>
		</tr>
	{/each}
</table>
