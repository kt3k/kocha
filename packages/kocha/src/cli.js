const { select } = require('action-selector')
const pkg = require('../package')

/**
 * The command line interface.
 */
class Cli {
  /**
   * The entry point of cli.
   * @param {object} argv The command line options parsed by minimist
   */
  main (argv) {
    this.argv = argv

    const version = argv.version
    const help = argv.help

    select(this, { version: version, help: help, run: true })
      .on('action', action => action.call(this))
  }

  /**
   * Shows the help message.
   */
  'action:help' () {
    this['action:version']()

    console.log(`
Usage: ${pkg.name} [options] <file[, ...files]>

Options:
  -h, --help                Shows the help message
  -v, --version             Shows the version number
  -r, --require <name>      Requires the given module e.g. --require babel-register
  -c, --config <path>       Specify the config file path e.g. --config kocha.e2e.config.js
  -t, --timeout <ms>        Sets the test-case timeout in milliseconds. Default is 2000.

Examples:
  kocha test/               Runs all the tests under test/.

  kocha "src{/,**/}__tests__/**/*.js"
                            Runs tests under the directory pattern src/**/__tests__/.

  kocha --require babel-register --require babel-polyfill test/
                            Runs tests under test/ using babel and babel-polyfill.

  kocha --require coffee-script/register "test/**/*.coffee"
                            Runs coffeescript tests under test/.
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

    require('./actions/run')(this.argv)
  }
}

module.exports = Cli
