const tty = require('tty')
const diff = require('diff')
const ms = require('ms')
const utils = require('../utils')
const supportsColor = process.browser ? null : require('supports-color')

/**
 * Save timer references to avoid Sinon interfering.
 * See: https://github.com/mochajs/mocha/issues/237
 */
/* eslint-disable no-unused-vars, no-native-reassign */
const Date = global.Date
const setTimeout = global.setTimeout
const setInterval = global.setInterval
const clearTimeout = global.clearTimeout
const clearInterval = global.clearInterval
/* eslint-enable no-unused-vars, no-native-reassign */

/**
 * Check if both stdio streams are associated with a tty.
 */
const isatty = tty.isatty(1) && tty.isatty(2)

/**
 * Enable coloring by default, except in the browser interface.
 */
const useColors = !process.browser && (supportsColor || (process.env.MOCHA_COLORS !== undefined))

/**
 * Default color map.
 */
const colors = {
  pass: 90,
  fail: 31,
  'bright pass': 92,
  'bright fail': 91,
  'bright yellow': 93,
  pending: 36,
  suite: 0,
  'error title': 0,
  'error message': 31,
  'error stack': 90,
  checkmark: 32,
  fast: 90,
  medium: 33,
  slow: 31,
  green: 32,
  light: 90,
  'diff gutter': 90,
  'diff added': 32,
  'diff removed': 31
}

/**
 * Default symbol map.
 */
const symbols = {
  ok: '✓',
  err: '✖',
  dot: '․',
  comma: ',',
  bang: '!'
}

// With node.js on Windows: use symbols available in terminal default fonts
if (process.platform === 'win32') {
  symbols.ok = '\u221A'
  symbols.err = '\u00D7'
  symbols.dot = '.'
}

/**
 * Color `str` with the given `type`,
 * allowing colors to be disabled,
 * as well as user-defined color
 * schemes.
 *
 * @param {string} type
 * @param {string} str
 * @return {string}
 * @api private
 */
const color = function (type, str) {
  if (!exports.useColors) {
    return String(str)
  }
  return '\u001b[' + exports.colors[type] + 'm' + str + '\u001b[0m'
}

/**
 * Expose term window size, with some defaults for when stderr is not a tty.
 */
const window = {
  width: 75
}

if (isatty) {
  window.width = process.stdout.getWindowSize
    ? process.stdout.getWindowSize(1)[0]
    : tty.getWindowSize()[1]
}

/**
 * Expose some basic cursor interactions that are common among reporters.
 */
const cursor = {
  hide: function () {
    isatty && process.stdout.write('\u001b[?25l')
  },

  show: function () {
    isatty && process.stdout.write('\u001b[?25h')
  },

  deleteLine: function () {
    isatty && process.stdout.write('\u001b[2K')
  },

  beginningOfLine: function () {
    isatty && process.stdout.write('\u001b[0G')
  },

  CR: function () {
    if (isatty) {
      exports.cursor.deleteLine()
      exports.cursor.beginningOfLine()
    } else {
      process.stdout.write('\r')
    }
  }
}

/**
 * Outut the given `failures` as a list.
 * @api public
 * @param {Array} failures
 */
const list = function (failures) {
  console.log()
  failures.forEach(function (test, i) {
    var fmt = color('error title', '  %s) %s:\n') +
      color('error message', '     %s') +
      color('error stack', '\n%s\n')

    let msg
    let err = test.err
    let message
    if (err.message && typeof err.message.toString === 'function') {
      message = err.message + ''
    } else if (typeof err.inspect === 'function') {
      message = err.inspect() + ''
    } else {
      message = ''
    }
    let stack = err.stack || message
    let index = message ? stack.indexOf(message) : -1
    let actual = err.actual
    let expected = err.expected
    let escape = true

    if (index === -1) {
      msg = message
    } else {
      index += message.length
      msg = stack.slice(0, index)
      // remove msg from stack
      stack = stack.slice(index + 1)
    }

    // uncaught
    if (err.uncaught) {
      msg = 'Uncaught ' + msg
    }
    // explicitly show diff
    if (err.showDiff !== false && sameType(actual, expected) && expected !== undefined) {
      escape = false
      if (!(typeof actual === 'string' && typeof expected === 'string')) {
        err.actual = actual = utils.stringify(actual)
        err.expected = expected = utils.stringify(expected)
      }

      fmt = color('error title', '  %s) %s:\n%s') + color('error stack', '\n%s\n')
      const match = message.match(/^([^:]+): expected/)
      msg = '\n      ' + color('error message', match ? match[1] : msg)

      msg += unifiedDiff(err, escape)
    }

    // indent stack trace
    stack = stack.replace(/^/gm, '  ')

    console.log(fmt, (i + 1), test.fullTitle(), msg, stack)
  })
}

/**
 * Initialize a new `Base` reporter.
 *
 * All other reporters generally
 * inherit from this reporter, providing
 * stats such as test duration, number
 * of tests passed / failed etc.
 *
 * @param {Runner} runner
 * @api public
 */
class Base {
  constructor (runner) {
    const stats = this.stats = { suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 }
    const failures = this.failures = []

    this.runner = runner

    runner.stats = stats

    runner.on('start', function () {
      stats.start = new Date()
    })

    runner.on('suite', function (suite) {
      stats.suites = stats.suites || 0
      suite.root || stats.suites++
    })

    runner.on('test end', function () {
      stats.tests = stats.tests || 0
      stats.tests++
    })

    runner.on('pass', function (test) {
      stats.passes = stats.passes || 0

      if (test.duration > test.slow()) {
        test.speed = 'slow'
      } else if (test.duration > test.slow() / 2) {
        test.speed = 'medium'
      } else {
        test.speed = 'fast'
      }

      stats.passes++
    })

    runner.on('fail', function (test, err) {
      stats.failures = stats.failures || 0
      stats.failures++
      test.err = err
      failures.push(test)
    })

    runner.on('end', function () {
      stats.end = new Date()
      stats.duration = new Date() - stats.start
    })

    runner.on('pending', function () {
      stats.pending++
    })
  }

  /**
   * Output common epilogue used by many of
   * the bundled reporters.
   *
   * @api public
   */
  epilogue () {
    const stats = this.stats
    let fmt

    console.log()

    fmt = color('bright pass', ' ') + color('green', ' %d passing') + color('light', ' (%s)')

    console.log(fmt, stats.passes || 0, ms(stats.duration))

    if (stats.pending > 0) {
      fmt = color('pending', ' ') + color('pending', ' %d pending')

      console.log(fmt, stats.pending)
    }

    if (stats.failures > 0) {
      fmt = color('fail', '  %d failing')

      console.log(fmt, stats.failures)

      Base.list(this.failures)
      console.log()
    }

    console.log()
  }
}

/**
 * Returns a unified diff between two strings.
 *
 * @api private
 * @param {Error} err with actual/expected
 * @param {boolean} escape
 * @return {string} The diff.
 */
function unifiedDiff (err, escape) {
  const indent = '      '
  function cleanUp (line) {
    if (escape) {
      line = escapeInvisibles(line)
    }
    if (line[0] === '+') {
      return indent + colorLines('diff added', line)
    }
    if (line[0] === '-') {
      return indent + colorLines('diff removed', line)
    }
    if (line.match(/@@/)) {
      return null
    }
    if (line.match(/\\ No newline/)) {
      return null
    }
    return indent + line
  }
  function notBlank (line) {
    return typeof line !== 'undefined' && line !== null
  }
  const msg = diff.createPatch('string', err.actual, err.expected)
  const lines = msg.split('\n').splice(4)
  return '\n      ' +
    colorLines('diff added', '+ expected') + ' ' +
    colorLines('diff removed', '- actual') +
    '\n\n' +
    lines.map(cleanUp).filter(notBlank).join('\n')
}

/**
 * Returns a string with all invisible characters in plain text
 *
 * @api private
 * @param {string} line
 * @return {string}
 */
const escapeInvisibles = line => line
  .replace(/\t/g, '<tab>')
  .replace(/\r/g, '<CR>')
  .replace(/\n/g, '<LF>\n')

/**
 * Color lines for `str`, using the color `name`.
 * @api private
 * @param {string} name
 * @param {string} str
 * @return {string}
 */
const colorLines = (name, str) => str.split('\n').map(str => color(name, str)).join('\n')

/**
 * Object#toString reference.
 */
const objToString = Object.prototype.toString

/**
 * Check that a / b have the same type.
 *
 * @api private
 * @param {Object} a
 * @param {Object} b
 * @return {boolean}
 */
const sameType = (a, b) => objToString.call(a) === objToString.call(b)

exports = module.exports = Base
exports.useColors = useColors
exports.color = color
exports.colors = colors
exports.window = window
exports.cursor = cursor
exports.list = list
exports.symbols = symbols
