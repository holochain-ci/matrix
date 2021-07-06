import { assertExists } from './assert'

import dotenv from 'dotenv'
dotenv.config()

assertExists(
  process.env['PUBLIC_REPOS_GITHUB_ACCESS_TOKEN'],
  "process.env['PUBLIC_REPOS_GITHUB_ACCESS_TOKEN']"
)
export const GITHUB_ACCESS_TOKEN = process.env['PUBLIC_REPOS_GITHUB_ACCESS_TOKEN']

export const GITHUB_ORGS_ALL_REPOS = process.env['GITHUB_ORGS_ALL_REPOS']?.trim()
  ? process.env['GITHUB_ORGS_ALL_REPOS'].trim().split(/\s+/)
  : []

export const MAX_REPOS = process.env['MAX_REPOS'] == null ? null : integer(process.env['MAX_REPOS'])

export const MAX_DAYS_SINCE_LAST_PUSH =
  process.env['MAX_DAYS_SINCE_LAST_PUSH'] == null
    ? null
    : integer(process.env['MAX_DAYS_SINCE_LAST_PUSH'])

// pedantically ensure that string contains only an integer
function integer(value: string) {
  let isInt = true
  value = value.trim()
  if (value === '') isInt = false
  const number = Number(value)
  if (!Number.isInteger(number)) isInt = false
  if (!isInt) {
    throw new Error(`Expected a string containing only an integer value, but got: \`${value}\``)
  }
  return number
}
