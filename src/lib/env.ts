import { assertExists } from './assert'


assertExists(
  import.meta.env.VITE_GITHUB_ACCESS_TOKEN,
  "import.meta.env.VITE_GITHUB_ACCESS_TOKEN"
)

export const GITHUB_ACCESS_TOKEN = import.meta.env.VITE_GITHUB_ACCESS_TOKEN
