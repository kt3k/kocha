const { select } = require('action-selector')
const pkg = require('../package')
const kocha = require('./')
const path = require('path')
const { getRunner } = kocha
const lookupFilesAll = require('./utils/lookup-files-all')
const { EventEmitter } = require('events')
const color = require('./utils/color')
const ms = require('ms')
const { existsSync } = require('fs')

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
  -c, --config <path>       Specify the config file path e.g. --config kocha.e2e.config.js
  -t, --timeout <ms>        Sets the test-case timeout in milliseconds. Default is 2000.

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
      console.log('See ' + color('cyan', 'kocha -h') + ' for the usage')
      process.exit(1)
    }

    // --require
    const modules = [].concat(this.argv.r, this.argv.require).filter(Boolean)

    modules.forEach(moduleName => {
      console.log(color('magenta', 'Requiring: ') + moduleName)
      require(moduleName)
    })

    // --config
    const config = this.argv.config

    if (config) {
      if (!existsSync(config)) {
        console.log(color('error message', 'Error:') + ` The given config file is not found: ${config}`)
        process.exit(1)
      }

      const configPath = path.resolve(process.cwd(), config)
      console.log(color('magenta', 'Requiring: ') + configPath)
      require(configPath)
    } else {
      if (existsSync('kocha.config.js')) {
        const configPath = path.resolve(process.cwd(), 'kocha.config.js')
        console.log(color('magenta', 'Requiring: ') + configPath)
        require(configPath)
      }
    }

    // --timeout
    const timeout = this.argv.t || this.argv.timeout

    if (timeout != null) {
      const duration = ms(timeout)

      if (duration == null) {
        console.log(color('error message', 'Error:') + ` The timeout duration is invalid: "${timeout}"`)
        process.exit(1)
      }

      console.log(`Setting timeout duration: ${duration}ms`)
      kocha.timeout(duration)
    }

    const files = lookupFilesAll(this.argv._, { cwd: process.cwd() })

    if (files.length === 0) {
      console.log(color('error message', 'Error:') + ' No input file')
      console.log('See ' + color('cyan', 'kocha -h') + ' for the usage')
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
