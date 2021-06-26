#!/usr/bin/env node

import { readFile } from 'fs/promises'
import { join } from 'path'
import { program } from 'commander'
import { bgRed, grey, magenta, red, yellow } from 'chalk'
import ora from 'ora'
import colorize from 'json-colorizer'
import { findDeprecated } from '.'
import debug from './util/debug'

const { dir, json } = program
  .option('-d, --dir <path>', 'Path to the directory containing package.json')
  .option('-j, --json', 'Display output as JSON')
  .parse(process.argv)
  .opts()

const packagePath = dir
  ? join(process.cwd(), dir, 'package.json')
  : join(process.cwd(), 'package.json')

const logError = (message: string) => {
  console.log(bgRed.white('!!!ERROR!!!'), red(message))
}

const spinner = ora({
  spinner: 'line',
  text: 'Checking dependencies...'
})

;(async () => {
  try {
    const packageJSON = (await readFile(packagePath)).toString()
    if (!packageJSON)
      return logError(`No package.json found at ${grey(packagePath)}`)
    const { dependencies = {}, devDependencies = {} } = JSON.parse(packageJSON)
    const allDeps = [
      ...Object.keys(dependencies),
      ...Object.keys(devDependencies)
    ]
    spinner.start()
    const { checked, deprecated, totalChecked, totalDeprecated } =
      await findDeprecated(allDeps)
    if (json) {
      spinner.succeed('Done checking dependencies:')
      console.log(
        colorize(
          JSON.stringify({
            totalChecked,
            totalDeprecated,
            checked,
            deprecated
          }),
          { pretty: true }
        )
      )
    } else {
      spinner.succeed(
        `Found ${totalDeprecated} deprecated dependencies (${totalChecked} checked)${
          totalDeprecated > 0 ? ':' : ''
        }`
      )
      deprecated.forEach(({ dependency, notice }) => {
        console.log(
          grey('  -'),
          `${magenta(dependency)}${grey(':')}`,
          yellow(notice)
        )
      })
    }
  } catch (error) {
    debug.error(error)
    spinner.fail('Failed to check dpendencies.')
  }
})()
