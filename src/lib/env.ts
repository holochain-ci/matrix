import { assertExists } from "./assert"

import dotenv from 'dotenv'
const dotenvResult = dotenv.config()
if (dotenvResult.error) {
  throw dotenvResult.error
}

assertExists(process.env['GITHUB_ACCESS_TOKEN'])
export const GITHUB_ACCESS_TOKEN = process.env['GITHUB_ACCESS_TOKEN']
