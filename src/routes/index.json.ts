import { Octokit } from 'octokit'

import { assertEqual, assertExists } from '$lib/assert'
import { GITHUB_ACCESS_TOKEN, MAX_REPOS } from '$lib/env'

// eslint-disable-next-line @typescript-eslint/ban-types
export async function get(): Promise<{ body: { repos: Array<object> } }> {
  // console.log('~~~~~~~~')
  // console.log(GITHUB_ACCESS_TOKEN.slice(0, 2) + '...' + GITHUB_ACCESS_TOKEN.slice(-2))
  // console.log('~~~~~~~~')
  const octokit = new Octokit({ auth: GITHUB_ACCESS_TOKEN })

  // const repoFullNames = [
  //   'holochain/admin-ui',
  //   'holochain/bootstrap',
  //   'holochain/devhub-dnas',
  //   'holochain/docs-pages',
  //   'holochain/elemental-chat-ui',
  //   'holochain/elemental-chat',
  //   'holochain/hc-utils',
  //   'holochain/holochain-conductor-api',
  //   'holochain/holochain-dna-build-tutorial',
  //   'holochain/holochain-wasmer',
  //   'holochain/holochain',
  //   'holochain/holonix',
  //   'holochain/lair',
  //   'holochain/tryorama',
  // ]

  // const repoPromises = repoFullNames.map((repoFullName) => {
  //   const [owner, repo] = repoFullName.split('/')
  //   return octokit.rest.repos.get({ owner, repo })
  // })
  // const repoResponses = await Promise.all(repoPromises)
  // // console.log(repoResponses)
  // let repos = repoResponses.map((repoResponse) => repoResponse.data)

  const reposResponse = await octokit.rest.repos.listForOrg({
    org: 'holochain',
    sort: 'pushed',
    per_page: MAX_REPOS || 100,
  })
  const repos = reposResponse.data
  // console.log(repos)
  // .catch(console.error)

  const workflowPromises = repos.map((repo) => {
    assertExists(repo.owner)
    return octokit.rest.actions.listRepoWorkflows({ owner: repo.owner.login, repo: repo.name })
  })
  const workFlowPromisesFulfilled = await Promise.all(workflowPromises)
  // .catch(console.error)

  assertEqual(repos.length, workFlowPromisesFulfilled.length)

  for (let i = 0; i < repos.length; i++) {
    repos[i].workflows = workFlowPromisesFulfilled[i].data.workflows
  }

  return { body: { repos } }
}
