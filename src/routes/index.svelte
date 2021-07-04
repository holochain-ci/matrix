<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit'

  export const load: Load = async ({ fetch }) => {
    const res = await fetch('/index.json')

    if (res.ok) {
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
  import SvelteTable from 'svelte-table'

  export let repos // expose the repos that were fetched from index.json
  const rows = repos

  const columns = [
    {
      key: 'repo',
      title: 'Repo',
      value: (repo) => repo.full_name,
      renderValue: (repo) => {
        return `<a href="https://github.com/${repo.full_name}">${repo.full_name}</a>`
      },
      sortable: true,
    },
    {
      key: 'github_workflows',
      title: 'Github Actions',
      renderValue: (repo) => {
        return repo.workflows
          .map((workflow) => {
            return `
            <a href="https://github.com/${repo.full_name}/actions/${workflow.path.replace(
              /\.github\//,
              ''
            )}" >
              <img
                src="${workflow.badge_url}?branch=${repo.default_branch}"
                alt="Github Actions status for ${repo.full_name}"
              />
            </a>
            `
          })
          .join(' ')
      },
      sortable: false,
    },
    {
      key: 'circleci',
      title: 'Circle CI',
      renderValue: (repo) => {
        return `<a href="https://circleci.com/gh/${repo.full_name}">
          <img
            src="https://circleci.com/gh/${repo.full_name}.svg?style=svg"
            alt="CircleCI build status for ${repo.full_name}"
            onError="this.parentElement.href = '#'; this.src = 'images/circle-ci-no-builds.svg'"
          />
        </a>
`
      },
      sortable: false,
    },
    {
      key: 'last_push',
      title: 'Last Push',
      value: (repo) => repo.pushed_at,
      renderValue: (repo) => {
        return repo.pushed_at
      },
      sortable: true,
    },
  ]
</script>

<SvelteTable {columns} {rows} iconAsc="↑" iconDesc="↓" />
