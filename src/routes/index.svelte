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
  import SvelteTable from 'svelte-table'

  export let repos
  // console.log(repos)

  const rows = repos.map((repo) => {
    return {
      default_branch: repo.default_branch,
      full_name: repo.full_name,
      workflows: repo.workflows,
    }
  })

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
      // value: (repo) => repo.xxxxx,
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
      // value: (repo) => repo.xxxxx,
      renderValue: (repo) => {
        return `<a href="https://circleci.com/gh/${repo.full_name}">
          <img
            src="https://circleci.com/gh/${repo.full_name}.svg?style=svg"
            alt="CircleCI build status for ${repo.full_name}"
            onError="this.parentElement.href = 'https://circleci.com/add-projects'; this.src = 'images/circle-ci-no-builds.svg'"
          />
        </a>
`
      },
      sortable: false,
    },
  ]
</script>

<SvelteTable {columns} {rows} iconAsc="↑" iconDesc="↓" />
