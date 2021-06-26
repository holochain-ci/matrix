import { Octokit, App, Action } from "octokit";

export async function get() {

  const octokit = new Octokit({})
  const repoFullNames = ['holochain/holochain',
    'holochain/holochain-dna-build-tutorial']

  // const repos = repoFullNames.map((repoFullName) => {
  //   // const owner, repo = repoFullName.split('/')
  //   return { owner, repo }
  // })

  const repoPromises = repoFullNames.map((repoFullName) => {
    const [owner, repo] = repoFullName.split('/')
    return octokit.rest.repos.get({ owner, repo })
  })


  const repoResponses = await Promise.allSettled(repoPromises)
  // console.log(repoResponses)
  const reposData = repoResponses.map((repoResponse) => repoResponse.value.data)
  // console.log(reposData)

  // const repos = Promise.all(repoFullNames).then((repos) => {
  // })

  // console.log(octokit)
  // octokit.rest.actions.listRepoWorkflows({owner, repo})
  const wfs = await octokit.rest.actions.listRepoWorkflows({ owner: 'holochain', repo: 'holochain' })
  // console.log(wfs.data.workflows)


  return {
    body: {
      repos: ['holochain/holochain', 'holochain/blarg']
    }
  }
}
