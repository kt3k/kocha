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
    console.log(color('error message', 'Error:') + ' No input file')
    console.log('See ' + color('cyan', 'kocha -h') + ' for the usage')
    process.exit(1)
  }

  // --require
  const modules = [].concat(argv.require).filter(Boolean)

  modules.forEach(moduleName => {
    console.log(color('magenta', 'Requiring: ') + moduleName)
    require(moduleName)
  })

  // --config
  const config = argv.config

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
  const timeout = argv.timeout

  if (timeout != null) {
    const duration = ms(timeout)

    if (duration == null) {
      console.log(color('error message', 'Error:') + ` The timeout duration is invalid: "${timeout}"`)
      process.exit(1)
    }

    console.log(`Setting timeout duration: ${duration}ms`)
    kocha.timeout(duration)
  }

  const files = lookupFilesAll(argv._, { cwd: process.cwd() })

  if (files.length === 0) {
    console.log(color('error message', 'Error:') + ' No input file')
    console.log('See ' + color('cyan', 'kocha -h') + ' for the usage')
    process.exit(1)
  }

  files.forEach(file => { require(file) })

  const runner = kocha.getRunner()

  const Reporter = require('../reporters/spec')
  const reporter = new Reporter(runner)
  if (reporter) {}

  let failed = false

  runner
    .on('fail', () => { failed = true })
    .on('end', () => setTimeout(() => process.exit(failed ? 1 : 0)))
    .run().catch(console.log)
}
