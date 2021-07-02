#!/usr/bin/env bash
set -euo pipefail

. .env
curl -H "Authorization: token ${PUBLIC_REPOS_GITHUB_ACCESS_TOKEN}" -X GET https://api.github.com/rate_limit
