/**
 * Enable coloring by default, except in the browser interface.
 */
const useColors = !process.browser && require('supports-color')

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
  if (!useColors) {
    return String(str)
  }
  return '\u001b[' + colors[type] + 'm' + str + '\u001b[0m'
}

/**
 * Color lines for `str`, using the color `name`.
 * @api private
 * @param {string} name
 * @param {string} str
 * @return {string}
 */
const colorLines = (name, str) => str.split('\n').map(str => color(name, str)).join('\n')

exports = module.exports = color
exports.useColors = useColors
exports.colors = colors
exports.colorLines = colorLines
