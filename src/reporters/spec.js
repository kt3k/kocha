const Base = require('./base')
const color = require('../utils/color')

/**
 * Initialize a new `Spec` test reporter.
 *
 * @api public
 * @param {Runner} runner
 */
class Spec extends Base {
  constructor (runner) {
    super(runner)

    let indents = 0
    let n = 0

    const indent = () => Array(indents).join('  ')

    runner.on('start', () => {
      console.log()
    })

    runner.on('suite', suite => {
      ++indents
      console.log(color('suite', '%s%s'), indent(), suite.title)
    })

    runner.on('suite end', () => {
      --indents
      if (indents === 1) {
        console.log()
      }
    })

    runner.on('pending', test => {
      const fmt = indent() + color('pending', '  - %s')
      console.log(fmt, test.title)
    })

    runner.on('pass', test => {
      let fmt
      if (test.speed === 'fast') {
        fmt = indent() +
          color('checkmark', '  ' + Base.symbols.ok) +
          color('pass', ' %s')
        console.log(fmt, test.title)
      } else {
        fmt = indent() +
          color('checkmark', '  ' + Base.symbols.ok) +
          color('pass', ' %s') +
          color(test.speed, ' (%dms)')
        console.log(fmt, test.title, test.duration)
      }
    })

    runner.on('fail', test => {
      console.log(indent() + color('fail', '  %d) %s'), ++n, test.title)
    })

    runner.on('end', () => this.epilogue())
  }
}

module.exports = Spec
