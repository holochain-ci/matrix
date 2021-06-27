<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit'

  export const load: Load = async ({ fetch }) => {
    const res = await fetch('/index.json')

    if (res.ok) {
      // console.log(res);
      const json = await res.json()
      const repos = await json.repos
      return {
        props: { repos },
      }
    }

    const { message } = await res.json()
    return {
      error: new Error(message),
    }
  }
</script>

<script lang="ts">
  export let repos
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
      <td><a href="https://github.com/{repo.full_name}">{repo.full_name}</a></td>
      <td>
        {#each repo.workflows as workflow}
          <a
            href="https://github.com/{repo.full_name}/actions/{workflow.path.replace(
              /\.github\//,
              ''
            )}"
          >
            <img src="{workflow.badge_url}?branch={repo.default_branch}" />
          </a>
        {/each}
      </td>
      <td>
        <a href="https://circleci.com/gh/{repo.full_name}">
          <img
            src="https://circleci.com/gh/{repo.full_name}.svg?style=svg"
            alt="CircleCI build status for {repo.full_name}"
            onError="this.parentElement.href = 'https://circleci.com/add-projects'; this.src = 'images/circle-ci-no-builds.svg'"
          />
        </a>
      </td>
    </tr>
  {/each}
</table>
