import { Octokit } from 'octokit'

import { assertEqual, assertExists } from '$lib/assert'
import { GITHUB_ACCESS_TOKEN, MAX_REPOS } from '$lib/env'

// eslint-disable-next-line @typescript-eslint/ban-types
export async function get(): Promise<{ body: { repos: Array<object> } }> {
  const GITHUB_ORGS = [
    'compository',
    'glassbeadsoftware',
    'h-be',
    'hc-institute-japan',
    'holo-host',
    'holochain-ci',
    'holochain-gym',
    'holochain-in-action',
    'holochain-open-dev',
    'holochain',
    'juntofoundation',
    'perspect3vism',
    'Sprillow',
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
  let repos = repoLists.flat() // Just flattens first level of nesting

  // console.log(repos)

  repos.sort((a, b) => {
    return a.pushed_at > b.pushed_at ? -1 : 1
  })

  if (MAX_REPOS) {
    repos = repos.slice(0, MAX_REPOS)
  }

  const workflowPromises = repos.map((repo) => {
    assertExists(repo.owner)
    return octokit.rest.actions.listRepoWorkflows({ owner: repo.owner.login, repo: repo.name })
  })
  const workflowPromisesFulfilled = await Promise.all(workflowPromises)
  // .catch(console.error)

  assertEqual(repos.length, workflowPromisesFulfilled.length)

  for (let i = 0; i < repos.length; i++) {
    repos[i].workflows = workflowPromisesFulfilled[i].data.workflows
  }

  // trim down to the fields needed by front end
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
