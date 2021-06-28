import { assertExists } from "./assert"

import dotenv from 'dotenv'
dotenv.config()

assertExists(process.env['PUBLIC_REPOS_GITHUB_ACCESS_TOKEN'], "process.env['PUBLIC_REPOS_GITHUB_ACCESS_TOKEN']")
export const GITHUB_ACCESS_TOKEN = process.env['PUBLIC_REPOS_GITHUB_ACCESS_TOKEN']
