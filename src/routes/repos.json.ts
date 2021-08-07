import {
  addHolochainVersionDataToRepos,
  addWorkflows,
  fetchRepos,
  filterRepos,
  indexHolochainVersions,
  sortRepos,
} from '$lib/repos'

import { updateRepoForks } from '$lib/updateForks'

// eslint-disable-next-line @typescript-eslint/ban-types
export async function get(): Promise<{ body: { repos: RepoForUi[] } }> {
  let repos
  repos = await fetchRepos()
  repos = sortRepos(repos, 'pushed_at')
  repos = filterRepos(repos)
  repos = await addWorkflows(repos)
  repos = await addHolochainVersionDataToRepos(repos)
  repos = indexHolochainVersions(repos)
  repos = await updateRepoForks(repos)
  repos = fieldsForUi(repos)

  return { body: { repos } }
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
function fieldsForUi(repos): RepoForUi[] {
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
