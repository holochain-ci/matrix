import { Octokit } from 'octokit'
import dayjs from 'dayjs'
import Promise from 'bluebird'

import { assertEqual, assertExists } from '$lib/assert'
import {
  GITHUB_ACCESS_TOKEN,
  GITHUB_ORGS_ALL_REPOS,
  MAX_DAYS_SINCE_LAST_PUSH,
  MAX_REPOS,
} from '$lib/env'

const OCTOKIT = new Octokit({ auth: GITHUB_ACCESS_TOKEN })

// eslint-disable-next-line @typescript-eslint/ban-types
export async function get(): Promise<{ body: { repos: Array<RepoForUi> } }> {
  let repos
  repos = await fetchRepos()
  repos = sortRepos(repos)
  repos = filterRepos(repos)
  repos = await addWorkflows(repos)
  repos = fieldsForUi(repos)

  return { body: { repos } }
}

async function fetchRepos() {
  const repoListPromises = GITHUB_ORGS_ALL_REPOS.map((githubOrg) => {
    return OCTOKIT.rest.repos.listForOrg({
      org: githubOrg,
      sort: 'pushed',
      per_page: MAX_REPOS,
    })
  })

  const repoListResponses = await Promise.all(repoListPromises)
  // .catch(console.error)
  const repoLists = repoListResponses.map((response) => response.data)
  const repos = repoLists.flat()
  return repos
}

function sortRepos(repos) {
  return repos.sort((a, b) => {
    if (a.pushed_at == null)
      throw new Error(
        `One or more repos are missing .pushed_at field: ${JSON.stringify({ repos })}`
      )
    return a.pushed_at > b.pushed_at ? -1 : 1
  })
}

function filterRepos(repos) {
  repos = repos.slice(0, MAX_REPOS)

  const now = dayjs()
  const oldest = now.subtract(MAX_DAYS_SINCE_LAST_PUSH, 'day')
  repos = repos.filter((repo) => {
    return dayjs(repo.pushed_at) > oldest
  })
  return repos
}

async function addWorkflows(repos) {
  const workflowPromises = repos.map((repo) => {
    assertExists(repo.owner)
    return OCTOKIT.rest.actions.listRepoWorkflows({ owner: repo.owner.login, repo: repo.name })
  })
  const workflows = await Promise.all(workflowPromises)
  // .catch(console.error)
  assertEqual(repos.length, workflows.length)

  for (let i = 0; i < repos.length; i++) {
    repos[i].workflows = workflows[i].data.workflows
  }
  return repos
}

type RepoForUi = {
  default_branch: string
  full_name: string
  nix_holochain_version: string
  nix_holochain_version_date: string
  pushed_at: string
  workflows: string
}

// trim down to the fields needed by interface
function fieldsForUi(repos): Array<RepoForUi> {
  repos = repos.map((repo) => {
    const workflowData = repo.workflows.map((workflow) => {
      return {
        badge_url: workflow.badge_url,
        path: workflow.path,
      }
    })
    return {
      default_branch: repo.default_branch,
      full_name: repo.full_name,
      pushed_at: repo.pushed_at,
      workflows: workflowData,
    }
  })
  return repos
}
