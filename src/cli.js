const chalk = require('chalk')
const { select } = require('action-selector')
const pkg = require('../package')
const { getRunner } = require('./')
const requireGlob = require('require-glob')
const { EventEmitter } = require('events')


class Cli extends EventEmitter {
  main (argv) {
    this.argv = argv

    const v = argv.v
    const h = argv.h
    const version = argv.version
    const help = argv.help

    select(this, {
      version: v || version,
      help: h || help,
      run: true
    })
    .on('action', action => action.call(this))
  }

  'action:help' () {
    this['action:version']()

    console.log(`
Usage: ${pkg.name} [options] <files, ...>

Options:
  -h, --help          Shows the help message
  -v, --version       Shows the version number
`)
  }

  'action:version' () {
    console.log(`${pkg.name}@${pkg.version}`)
  }

  'action:run' () {
    this['action:version']()

    if (this.argv._.length === 0) {
      console.log(chalk.red('Error:') + ' No input file')
      process.exit(1)
    }

    requireGlob.sync(this.argv._, { cwd: process.cwd() })

    const runner = getRunner()

    const Reporter = require('./reporters/spec')
    const reporter = new Reporter(runner)
    if (reporter) {}

    let failed = false

    runner
      .on('fail', () => { failed = true })
      .on('end', () => setTimeout(() => process.exit(failed ? 1 : 0)))
      .run().catch(console.log)
  }
}

module.exports = Cli
