import { Octokit } from "octokit";

import { assertEqual } from "$lib/Assert";
import { GITHUB_ACCESS_TOKEN } from '$lib/env'

export async function get() {
  const octokit = new Octokit({ auth: GITHUB_ACCESS_TOKEN })

  const repoFullNames = [
    'holochain/admin-ui',
    'holochain/bootstrap',
    'holochain/devhub-dnas',
    'holochain/docs-pages',
    'holochain/elemental-chat-ui',
    'holochain/elemental-chat',
    'holochain/hc-utils',
    'holochain/holochain-conductor-api',
    'holochain/holochain-dna-build-tutorial',
    'holochain/holochain-wasmer',
    'holochain/holochain',
    'holochain/holonix',
    'holochain/lair',
    'holochain/tryorama',
  ]

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

  assertEqual(repos.length, workflowPromises.length)

  for (let i = 0; i < repos.length; i++) {
    repos[i].workflows = workFlowPromisesFulfilled[i].data.workflows
  }

  return { body: { repos } }
}
