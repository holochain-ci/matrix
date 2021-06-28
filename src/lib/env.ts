import { assertExists } from "./assert"

import dotenv from 'dotenv'
dotenv.config()

assertExists(process.env['GITHUB_ACCESS_TOKEN'])
export const GITHUB_ACCESS_TOKEN = process.env['GITHUB_ACCESS_TOKEN']
