/// <reference path="../src/lib/repos.ts"/>

import {
  fetchRepos,
  sortRepos,
  filterRepos,
  addHolochainVersionDataToRepos,
} from '../src/lib/repos'

const foo = await main()

async function main() {
  let repos: any
  repos = await fetchRepos()
  repos = sortRepos(repos, 'full_name')
  repos = filterRepos(repos)
  repos = await addHolochainVersionDataToRepos(repos)
  repos = filterReposOnlyWithHolochainVersion(repos)

  // get list of repos (which have a default.nix with holochainVersion)
  // creates or updates forks of happs
  // Forks eg guillem/hello-world to holochain-ci/guillem—-hello-world
  // Clones repos locally to /forks to use git CLI instead of GitHub API (avoids api limits and leverage developers’ git CLI knowledge)
  // Creates a branch in each repo, from the current HEAD of that repo’s default branch, for every holochain version (commit) which comes after the one they are using
  // eg branch: matrix/holochain-core-[holochain commit hash]
  // The change in this branch is just to the default.nix: holochain version, sha256, and cargoSha256 (hopefully by using https://github.com/Mic92/nix-update )
}

function filterReposOnlyWithHolochainVersion(repos: []) {
  return repos.filter((repo: any) => {
    return repo.nix_holochain_version
  })
}
