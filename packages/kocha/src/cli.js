const { select } = require('action-selector')
const pkg = require('../package')
const { getRunner } = require('./')
const lookupFilesAll = require('./utils/lookup-files-all')
const { EventEmitter } = require('events')
const color = require('./utils/color')

/**
 * The command line interface.
 */
class Cli extends EventEmitter {
  /**
   * The entry point of cli.
   * @param {object} argv The command line options parsed by minimist
   */
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

  /**
   * Shows the help message.
   */
  'action:help' () {
    this['action:version']()

    console.log(`
Usage: ${pkg.name} [options] <files, ...>

Options:
  -h, --help                Shows the help message
  -v, --version             Shows the version number
  -r, --require <name>      Requires the given module e.g. --require babel-register

Examples:
  kocha "test/**/*.js"      Runs all the tests under test/

  kocha "src{/,**/}__tests__/**/*.js"
                            Runs all the tests under src/**/__tests__/

  kocha --require babel-register "test/**/*.js"
                            Use babel in tests
`)
  }

  /**
   * Shows the version number.
   */
  'action:version' () {
    console.log(`${pkg.name}@${pkg.version}`)
  }

  /**
   * Runs the tests.
   */
  'action:run' () {
    this['action:version']()

    if (this.argv._.length === 0) {
      console.log(color('error message', 'Error:') + ' No input file')
      console.log('See ' + color('error message', 'kocha -h') + ' for the usage')
      process.exit(1)
    }

    const modules = [].concat(this.argv.r, this.argv.require).filter(Boolean)

    modules.forEach(moduleName => require(moduleName))

    const files = lookupFilesAll(this.argv._, { cwd: process.cwd() })

    if (files.length === 0) {
      console.log(color('error message', 'Error:') + ' No input file')
      console.log('See ' + color('error message', 'kocha -h') + ' for the usage')
      process.exit(1)
    }

    files.forEach(file => { require(file) })

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
