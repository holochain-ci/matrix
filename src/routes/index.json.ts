import { Octokit } from 'octokit'
import dayjs from 'dayjs'

import { assertEqual, assertExists } from '$lib/assert'
import { GITHUB_ACCESS_TOKEN, MAX_REPOS, MAX_DAYS_SINCE_LAST_PUSH } from '$lib/env'

// eslint-disable-next-line @typescript-eslint/ban-types
export async function get(): Promise<{ body: { repos: Array<object> } }> {
  const GITHUB_ORGS = [
    'compository',
    'h-be',
    'holo-host',
    'holochain-ci',
    'holochain-gym',
    'holochain-in-action',
    'holochain-open-dev',
    'holochain',
  ]

  const octokit = new Octokit({ auth: GITHUB_ACCESS_TOKEN })

  const repoListPromises = GITHUB_ORGS.map((githubOrg) => {
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

  const workflowListPromises = repos.map((repo) => {
    assertExists(repo.owner)
    return octokit.rest.actions.listRepoWorkflows({ owner: repo.owner.login, repo: repo.name })
  })
  const workflowListResponses = await Promise.all(workflowListPromises)
  // .catch(console.error)

  const workflowResponse = workflowListResponses[0]
  const workflow = workflowResponse.data.workflows[0]
  const badgeResponse = await fetch(`${workflow.badge_url}`)
  const badge = await badgeResponse.text()
  console.log(badge)

  assertEqual(repos.length, workflowListResponses.length)

  for (let i = 0; i < repos.length; i++) {
    repos[i].workflows = workflowListResponses[i].data.workflows
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
