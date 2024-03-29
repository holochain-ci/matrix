<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit'

  export const load: Load = async ({ fetch }) => {
    const res = await fetch('/repos.json')

    if (res.ok) {
      const json = await res.json()
      const { repos } = await json
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

  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime.js'
  dayjs.extend(relativeTime)

  const TRANSPARENT_1PX_PNG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII='

  // expose the values that were fetched from repos.json
  export let repos

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
            onError="this.parentElement.href = '#'; this.src='${TRANSPARENT_1PX_PNG}'"
          />
        </a>`
      },
      sortable: false,
    },
    {
      key: 'last_push',
      title: 'Last Push',
      value: (repo) => repo.pushed_at,
      renderValue: (repo) => {
        const howLongAgo = dayjs(repo.pushed_at).fromNow()
        return `<div title="${repo.pushed_at}">${howLongAgo}</div>`
      },
      sortable: true,
    },
  ]
</script>

<SvelteTable {columns} {rows} iconAsc="↑" iconDesc="↓" />
