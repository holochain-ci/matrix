// import 'dotenv/config'

// import dotenv from 'dotenv'
// dotenv.config()

import { Octokit } from "octokit";

import { GITHUB_ACCESS_TOKEN } from '../env'

export async function get() {

  console.log({ auth: GITHUB_ACCESS_TOKEN })
  console.log({ auth: GITHUB_ACCESS_TOKEN })
  console.log({ auth: GITHUB_ACCESS_TOKEN })
  const octokit = new Octokit({ auth: GITHUB_ACCESS_TOKEN })
  const repoFullNames = ['holochain/holochain',
    'holochain/holochain-dna-build-tutorial']

  const repoPromises = repoFullNames.map((repoFullName) => {
    const [owner, repo] = repoFullName.split('/')
    return octokit.rest.repos.get({ owner, repo })
  })
  const repoResponses = await Promise.all(repoPromises)
  // console.log(repoResponses)
  let repos = repoResponses.map((repoResponse) => repoResponse.data)

  const workflowPromises = repos.map((repo) => {
    return octokit.rest.actions.listRepoWorkflows({ owner: repo.owner.login, repo: repo.name })
  })
  const workFlowPromisesFulfilled = await Promise.all(workflowPromises)

  for (let i = 0; i < repos.length; i++) {
    repos[i].workflows = workFlowPromisesFulfilled[i].data
  }

  return {
    body: {
      repos
    }
  }
}
