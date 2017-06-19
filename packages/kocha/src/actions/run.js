const path = require('path')
const { existsSync } = require('fs')
const ms = require('ms')
const kocha = require('../')
const lookupFilesAll = require('../utils/lookup-files-all')
const color = require('../utils/color')

/**
 * Runs the tests.
 * @param {Object} argv The command line options parsed by minimist
 */
module.exports = argv => {
  if (argv._.length === 0) {
    noInputFilesAndExit()
  }

  // --require
  processRequireOption(argv.require)

  // --config
  processConfigOption(argv.config)

  // --timeout
  processTimeoutOption(argv.timeout)

  const files = lookupFilesAll(argv._, { cwd: process.cwd() })

  if (files.length === 0) {
    noInputFilesAndExit()
  }

  files.forEach(file => { require(file) })

  const runner = kocha.getRunner()

  const Reporter = require('../reporters/spec')
  new Reporter(runner) // eslint-disable-line no-new

  let failed = false

  runner
    .on('fail', () => { failed = true })
    .on('end', () => setTimeout(() => process.exit(failed ? 1 : 0)))
    .run().catch(console.log)
}

/**
 * Processes --require option
 * @param {string|string[]|undefined} requireOption The require option
 */
const processRequireOption = (requireOption) => {
  const modules = [].concat(requireOption).filter(Boolean)

  modules.forEach(moduleName => {
    requireModuleAndShowMessage(moduleName)
  })
}

/**
 * Processes --config option
 * @param {?string} config The config path
 */
const processConfigOption = (config) => {
  if (config) {
    if (!existsSync(config)) {
      showErrorAndExit(`The given config file is not found: ${config}`)
    }

    requireModuleAndShowMessage(path.resolve(process.cwd(), config))
  } else if (existsSync('kocha.config.js')) {
    // Loads default kocha.config.js if exists
    requireModuleAndShowMessage(path.resolve(process.cwd(), 'kocha.config.js'))
  }
}

/**
 * Processes --timeout option
 * @param {?string} timeout The timeout duration
 */
const processTimeoutOption = (timeout) => {
  if (timeout == null) {
    return
  }

  const duration = ms(timeout)

  if (duration == null) {
    showErrorAndExit(`The timeout duration is invalid: "${timeout}"`)
  }

  console.log(`Setting timeout duration: ${color('cyan', duration + 'ms')}`)
  kocha.timeout(duration)
}

/**
 * Shows error message for no input files and exits.
 */
const noInputFilesAndExit = () => {
  console.log(color('error message', 'Error: ') + 'No input file')
  console.log('See ' + color('cyan', 'kocha -h') + ' for the usage')
  process.exit(1)
}

/**
 * Requires the module and shows the message.
 * @param {string} modulePath The module path
 */
const requireModuleAndShowMessage = modulePath => {
  console.log(color('magenta', 'Requiring: ') + modulePath)
  require(modulePath)
}

/**
 * Shows the error message and exits.
 * @param {string} message The error message
 */
const showErrorAndExit = message => {
  console.log(color('error message', 'Error: ') + message)
  process.exit(1)
}
