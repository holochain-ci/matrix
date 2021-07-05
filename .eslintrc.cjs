module.exports = {
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  ignorePatterns: ['*.cjs', 'src/routes/svelte-table-examples/**/*'],
  overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2019,
  },
  plugins: ['svelte3', '@typescript-eslint'],
  settings: {
    'svelte3/typescript': () => require('typescript'),
  },
  rules: {
    'no-console': 'error',
  },
  root: true,
}
