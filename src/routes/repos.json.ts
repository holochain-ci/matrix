import { Octokit } from 'octokit'
import dayjs from 'dayjs'

import { assertEqual, assertExists } from '$lib/assert'
import {
  GITHUB_ACCESS_TOKEN,
  GITHUB_ORGS_ALL_REPOS,
  MAX_DAYS_SINCE_LAST_PUSH,
  MAX_REPOS,
} from '$lib/env'

// eslint-disable-next-line @typescript-eslint/ban-types
export async function get(): Promise<{ body: { repos: Array<object> } }> {
  const octokit = new Octokit({ auth: GITHUB_ACCESS_TOKEN })

  const repoListPromises = GITHUB_ORGS_ALL_REPOS.map((githubOrg) => {
    return octokit.rest.repos.listForOrg({
      org: githubOrg,
      sort: 'pushed',
      per_page: MAX_REPOS || 100,
    })
  })

  const repoListResponses = await Promise.all(repoListPromises)
  // .catch(console.error)
  const repoLists = repoListResponses.map((response) => response.data)
  let repos = repoLists.flat() // `flat()` only flattens first level of nesting

  repos.sort((a, b) => {
    if (a.pushed_at == null)
      throw new Error(
        `One or more repos are missing .pushed_at field: ${JSON.stringify({ repos })}`
      )
    return a.pushed_at > b.pushed_at ? -1 : 1
  })

  if (MAX_REPOS != null) {
    repos = repos.slice(0, MAX_REPOS)
  }

  if (MAX_DAYS_SINCE_LAST_PUSH != null) {
    const now = dayjs()
    const oldest = now.subtract(MAX_DAYS_SINCE_LAST_PUSH, 'day')
    repos = repos.filter((repo) => {
      return dayjs(repo.pushed_at) > oldest
    })
  }

  const workflowPromises = repos.map((repo) => {
    assertExists(repo.owner)
    return octokit.rest.actions.listRepoWorkflows({ owner: repo.owner.login, repo: repo.name })
  })
  const workflows = await Promise.all(workflowPromises)
  // .catch(console.error)

  assertEqual(repos.length, workflows.length)

  for (let i = 0; i < repos.length; i++) {
    repos[i].workflows = workflows[i].data.workflows
  }

  // trim down to the fields needed by interface
  repos = repos.map((repo) => {
    return {
      default_branch: repo.default_branch,
      full_name: repo.full_name,
      pushed_at: repo.pushed_at,
      workflows: repo.workflows,
    }
  })

  return { body: { repos } }
}
