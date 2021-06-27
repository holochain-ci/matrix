import { Octokit, App, Action } from "octokit";

export async function get() {

  const octokit = new Octokit({})
  const repoFullNames = ['holochain/holochain',
    'holochain/holochain-dna-build-tutorial']

  const repoPromises = repoFullNames.map((repoFullName) => {
    const [owner, repo] = repoFullName.split('/')
    return octokit.rest.repos.get({ owner, repo })
  })
  const repoResponses = await Promise.all(repoPromises)
  console.log(repoResponses)
  const repos = repoResponses.map((repoResponse) => repoResponse.data)

  // const workflowPromises = repos.map((repo) => {
  //   return octokit.rest.actions.listRepoWorkflows({ owner: repo.owner.login, repo: repo.name })
  // })
  // const workFlowPromisesFulfilled = await Promise.all(workflowPromises)
  // const workflows = repoResponses.map((repoResponse) => repoResponse.value.data)

  repos.map((repo) => {
    octokit.rest.actions.listRepoWorkflows({ owner: repo.owner.login, repo: repo.name })
      .then((workflows) => {
        repo.workflows = workflows.data.workflows
        console.log(repo)
      })
  })

  return {
    body: {
      repos
    }
  }
}
