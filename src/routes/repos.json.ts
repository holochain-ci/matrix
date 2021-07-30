import { Octokit } from 'octokit'
import dayjs from 'dayjs'
import { readFileSync, existsSync } from 'fs'
import Promise from 'bluebird'

import { run } from '$lib/run'
import { assertEqual, assertExists, assertPresent } from '$lib/assert'
import {
  GITHUB_ACCESS_TOKEN,
  GITHUB_ORGS_ALL_REPOS,
  MAX_DAYS_SINCE_LAST_PUSH,
  MAX_REPOS,
  UPDATE_EXISTING_REPOS,
} from '$lib/env'

const REPOS_DIR = `${process.cwd()}/repos`
const HOLOCHAIN_REPO_NAME = `holochain/holochain`
const OCTOKIT = new Octokit({ auth: GITHUB_ACCESS_TOKEN })

// eslint-disable-next-line @typescript-eslint/ban-types
export async function get(): Promise<{ body: { repos: Array<RepoForUi>; totalVersions: number } }> {
  let repos
  repos = await fetchRepos()
  repos = sortRepos(repos)
  repos = filterRepos(repos)
  repos = await addWorkflows(repos)
  repos = await addHolochainVersionDataToRepos(repos)

  const versionData = indexHolochainVersions(repos)
  ;({ repos } = versionData)
  const { totalVersions } = versionData
  repos = fieldsForUi(repos)

  return { body: { repos, totalVersions } }
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

async function addHolochainVersionDataToRepos(repos) {
  cloneOrUpdateLocalCopyByName(HOLOCHAIN_REPO_NAME, { updateExistingRepo: true })
  repos = await Promise.map(
    repos,
    (repo) => {
      cloneOrUpdateLocalCopy(repo)
      repo = addHolochainVersionData(repo)
      return repo
    },
    { concurrency: 5 }
  )
  return repos
}

function cloneOrUpdateLocalCopy(repo): void {
  assertPresent(repo.full_name)
  cloneOrUpdateLocalCopyByName(repo.full_name)
}

function cloneOrUpdateLocalCopyByName(
  repoFullName: string,
  options = { updateExistingRepo: false }
): void {
  const repoDir = `${REPOS_DIR}/${repoFullName}`
  if (existsSync(`${repoDir}/.git/`)) {
    if (UPDATE_EXISTING_REPOS === true || options.updateExistingRepo === true) {
      run(`cd ${repoDir} && git fetch`)
      run(`cd ${repoDir} && ( git reset FETCH_HEAD --hard || git reset --hard )`)
      run(`cd ${repoDir} && git clean -fd`)
    }
  } else {
    run(`git clone --quiet https://github.com/${repoFullName}.git ${repoDir}`)
  }
}

function addHolochainVersionData(repo) {
  const NIX_HC_VERSION_PATTERN =
    /holochainVersion\s*=\s*{\s*rev\s*=\s*"(?<holochainVersion>[0-9a-f]{40})"/
  const repoDir = `${REPOS_DIR}/${repo.full_name}`
  const nixPath = `${repoDir}/default.nix`
  if (existsSync(nixPath)) {
    const nixConfig = readFileSync(nixPath).toString()
    const match = NIX_HC_VERSION_PATTERN.exec(nixConfig)
    const holochainVersion = match?.groups?.holochainVersion
    if (holochainVersion) {
      repo.nix_holochain_version = holochainVersion
      repo.nix_holochain_version_date = getholochainVersionDate(holochainVersion)
    }
  }
  return repo
}

function getholochainVersionDate(holochainVersion) {
  const STRICT_ISO_8601_DATE = '%cI'
  return run(
    `cd ${REPOS_DIR}/${HOLOCHAIN_REPO_NAME} && ` +
      `git show --no-patch --no-notes --pretty='${STRICT_ISO_8601_DATE}' ${holochainVersion}`
  ).trim()
}

function indexHolochainVersions(repos) {
  const dates: Array<string> = []
  repos.forEach((repo) => {
    const date = repo.nix_holochain_version_date
    if (date && !dates.includes(date)) {
      dates.push(date)
    }
  })
  dates.sort()
  repos = repos.map((repo) => {
    const date = repo.nix_holochain_version_date
    if (date) {
      repo.nix_holochain_version_date_index = dates.length - (dates.indexOf(date) + 1)
    }
    return repo
  })
  return { repos, totalVersions: dates.length }
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
      nix_holochain_version: repo.nix_holochain_version,
      nix_holochain_version_date: repo.nix_holochain_version_date,
      nix_holochain_version_date_index: repo.nix_holochain_version_date_index,
      pushed_at: repo.pushed_at,
      workflows: workflowData,
    }
  })
  return repos
}
