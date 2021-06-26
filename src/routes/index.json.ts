import { Octokit, App, Action } from "octokit";

export async function get() {

  const repoFullNames = ['holochain/holochain', 'holochain/blarg']

  // const repos = repoFullNames.map((repoFullName) => {
  //   // const owner, repo = repoFullName.split('/')
  //   return { owner, repo }
  // })

  const octokit = new Octokit({})
  // console.log(octokit)
  // octokit.rest.actions.listRepoWorkflows({owner, repo})
  const wfs = await octokit.rest.actions.listRepoWorkflows({ owner: 'holochain', repo: 'holochain' })
  console.log(wfs.data.workflows)


  return {
    body: {
      repos: ['holochain/holochain', 'holochain/blarg']
    }
  }
}
