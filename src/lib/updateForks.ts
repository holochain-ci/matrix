import { Octokit } from 'octokit'
import Promise from 'bluebird'

import { run } from '$lib/run'

import { ADMIN_ORG_GITHUB_ACCESS_TOKEN } from '$lib/env'

const HOLOMATRIX_BRANCH_PREFIX = `holomatrix`
const HOLOMATRIX_ORG = `holomatrix7`
const REPOS_DIR = `${process.cwd()}/repos`
const HOLOCHAIN_REPO_NAME = `holochain/holochain`
const HOLOCHAIN_DIR = `${REPOS_DIR}/${HOLOCHAIN_REPO_NAME}`
const GITHUB = new Octokit({ auth: ADMIN_ORG_GITHUB_ACCESS_TOKEN })

export async function updateRepoForks(repos: any) {
  const forkableRepos = filterReposOnlyWithHolochainVersion(repos)
  repos = await createOrUpdateForks(forkableRepos)

  // creates or updates forks of happs
  // Forks eg guillem/hello-world to holochain-ci/guillem—-hello-world
  // Clones repos locally to /forks to use git CLI instead of GitHub API (avoids api limits and leverage developers’ git CLI knowledge)
  // Creates a branch in each repo, from the current HEAD of that repo’s default branch, for every holochain version (commit) which comes after the one they are using
  // eg branch: matrix/holochain-core-[holochain commit hash]
  // The change in this branch is just to the default.nix: holochain version, sha256, and cargoSha256 (hopefully by using https://github.com/Mic92/nix-update )

  return repos
}

function filterReposOnlyWithHolochainVersion(repos: []) {
  return repos.filter((repo: any) => {
    return repo.nix_holochain_version
  })
}

async function createOrUpdateForks(forkableRepos: []) {
  return await Promise.map(forkableRepos, createOrUpdateFork, { concurrency: 1 })
}

async function createOrUpdateFork(repo) {
  const forkResult = await GITHUB.rest.repos.createFork({
    owner: repo.owner.login,
    repo: repo.name,
    organization: HOLOMATRIX_ORG,
  })

  const fork = forkResult.data
  // console.log('fork created or touched')
  const newForkName = `${repo.owner.login}---${repo.name}`
  if (fork.name !== newForkName) {
    await GITHUB.rest.repos.update({
      owner: HOLOMATRIX_ORG,
      repo: fork.name,
      name: newForkName,
    })
    // console.log('fork name updated')
  }
  // const result = await GITHUB.rest.actions
  //   .enableSelectedRepositoryGithubActionsOrganization({
  //     org: HOLOMATRIX_ORG,
  //     repository_id: fork.id,
  //   })
  //   .catch(console.error)
  // // console.log(result)
  // console.log('fork actions enabled for: ' + fork.name)

  let response
  // response = await GITHUB.request(`PUT /orgs/${HOLOMATRIX_ORG}/actions/permissions`, {
  //   org: HOLOMATRIX_ORG,
  //   enabled_repositories: 'selected',
  //   allowed_actions: 'all',
  // })
  // console.log('set org permissions')
  // console.log(response)

  // console.log(repo.id)
  response = await GITHUB.request(
    `PUT /orgs/${HOLOMATRIX_ORG}/actions/permissions/repositories/${fork.id}`,
    { repository_id: fork.id }
  )
  console.log(`enabled actions for ${newForkName}`)
  /////

  const octokit = GITHUB

  await octokit.request(`PUT /repos/${HOLOMATRIX_ORG}/${newForkName}/actions/permissions`, {
    enabled: true,
  })
  console.log(`enabled actions at repo level for ${newForkName}`)

  const remote = `https://github.com/${HOLOMATRIX_ORG}/${newForkName}.git`

  const repoDir = `${REPOS_DIR}/${repo.full_name}`
  const holochainCandidateRefs = holochainRefsAfter(repo.nix_holochain_version_date, 1)
  // const branchesString = run(
  //   `cd ${repoDir} && git branch --remotes |grep '^\\s*${HOLOMATRIX_ORG}/'`,
  //   { relaxed: true }
  //   ).trim()
  //   if (branchesString) {
  //     branches = branchesString.split('\n')
  //     console.log(branches)
  //   } else {

  holochainCandidateRefs.forEach((holochainCandidateRef) => {
    // const branch = `holomatrix/holochain-core-${holochainCandidateRef}`
    // run(`git checkout -B ${branch} ${repo.default_branch}`, { cwd: repoDir })

    const branch = repo.default_branch
    run(`git checkout ${branch}`, { cwd: repoDir })

    run(`git commit --allow-empty -m'Holomatrix test'`, { cwd: repoDir })
    run(`git push --force ${remote} ${branch}:${branch}`, { cwd: repoDir })
  })
  // }
  // get all branches on remote `holomatrix7`
  // look for branch holomatrix7/holochain-core-[holochain commit hash]
  // if branch exists
  //    check that HEAD^ of fork === HEAD of default branch of repo (in origin remote)
  //    if not, update branch
  // else
  //    create repo if needed
  //    create branch with updated default.nix

  // const branch = `${HOLOMATRIX_BRANCH_PREFIX}/test`
  // run(`git checkout -B `)

  return repo
}

function holochainRefsAfter(holochainVersionDate: string, maxCount: number) {
  const refs = run(
    `git log
      --pretty="format:%H"
      --after="${holochainVersionDate}"
      --max-count=${maxCount}
      develop
    `,
    { cwd: HOLOCHAIN_DIR }
  )
  if (refs) {
    return refs.split('\n')
  } else {
    return []
  }
}
