import { run } from '$lib/run'

const HOLOMATRIX_ORG = `holomatrix7`
const REPOS_DIR = `${process.cwd()}/repos`
const HOLOCHAIN_REPO_NAME = `holochain/holochain`

export function updateRepoForks(repos: any) {
  let forkableRepos = filterReposOnlyWithHolochainVersion(repos)
  createOrUpdateForks(forkableRepos)

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

function createOrUpdateForks(forkableRepos) {
  forkableRepos.forEach((repo) => {
    const repoDir = `${REPOS_DIR}/${repo.full_name}`
    const branches = run(`cd ${repoDir} && git branch --remotes |grep '^\\s*${HOLOMATRIX_ORG}/'`, {
      relaxed: true,
    })
      .trim()
      .split('\n')
    console.log(branches)
    // get all branches on remote `holomatrix7`
    // look for branch holomatrix7/holochain-core-[holochain commit hash]
    // if branch exists
    //    check that HEAD^ === HEAD of default branch of repo (in origin remote)
    //    if not, update branch
    // else
    //    create branch with updated default.nix
  })
}
