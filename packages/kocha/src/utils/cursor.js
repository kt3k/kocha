'use strict'

const tty = require('tty'

/**
 * Check if both stdio streams are associated with a tty.
 */
); const isatty = tty.isatty(1) && tty.isatty(2

/**
 * Expose term window size, with some defaults for when stderr is not a tty.
 */
); const window = {
  width: 75
}

if (isatty) {
  window.width = process.stdout.getWindowSize ? process.stdout.getWindowSize(1)[0] : tty.getWindowSize()[1]
}

/**
 * Expose some basic cursor interactions that are common among reporters.
 */
const cursor = {
  hide: function hide () {
    isatty && process.stdout.write('\u001b[?25l')
  },
  show: function show () {
    isatty && process.stdout.write('\u001b[?25h')
  },
  deleteLine: function deleteLine () {
    isatty && process.stdout.write('\u001b[2K')
  },
  beginningOfLine: function beginningOfLine () {
    isatty && process.stdout.write('\u001b[0G')
  },
  CR: function CR () {
    if (isatty) {
      cursor.deleteLine()
      cursor.beginningOfLine()
    } else {
      process.stdout.write('\r')
    }
  }
}

module.exports = cursor
module.exports.window = window
