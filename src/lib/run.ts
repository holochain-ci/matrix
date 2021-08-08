// Originally decaffeinated from:
// https://github.com/harlantwood/lightsaber/blob/64a824c34f6b1bc7e745f62526fcafb103837368/src/shell.coffee

import chalk from 'chalk'

import lodash from 'lodash'
const { clone, defaults, merge, isEmpty } = lodash

import shelljs from 'shelljs'
const { exec, exit } = shelljs

type Options = {
  color?: boolean
  cwd?: string
  relaxed?: boolean
  quiet?: boolean
  quietCommand?: boolean
  quietResponse?: boolean
}

export function run(command: string, options: Options = {}): string {
  const originalOptions = clone(options)
  defaults(options, {
    color: true,
    relaxed: false,
    quiet: false,
    quietCommand: options.quiet != null ? options.quiet : false,
    quietResponse: options.quiet != null ? options.quiet : false,
  })

  command = command.replace(/\s+/g, ' ')

  if (!options.quietCommand) {
    let prettyCommand = `\n==> ${command}`
    if (options.color) prettyCommand = chalk.green(prettyCommand)

    let comment = `   ${isEmpty(originalOptions) ? '' : '# ' + JSON.stringify(originalOptions)}`
    if (options.color) comment = chalk.grey(comment)

    // eslint-disable-next-line no-console
    console.log(prettyCommand + comment)
  }

  const result = exec(command, merge(options, { silent: options.quietResponse }))

  const exitCode = result.code
  if (exitCode != null && exitCode !== 0 && !options.relaxed) {
    // eslint-disable-next-line no-console
    console.error(`COMMAND FAILED: ${JSON.stringify({ exitCode })}`)
    exit(exitCode)
  }

  return result.trim()
}
