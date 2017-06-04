const path = require('path')
const glob = require('glob')

/**
 * `require` all the scripts which matches the give glob patterns.
 * @param {string[]} patterns The patterns
 * @param {Object} options The options
 */
module.exports = (patterns, options) => {
  const { cwd } = options

  flatten(patterns.map(pattern => glob.sync(pattern, options)))
    .map(scriptRelativePath => path.resolve(cwd, scriptRelativePath))
    .forEach(scriptAbsPath => require(scriptAbsPath))
}

const flatten = arrays => Array.prototype.concat.apply([], arrays)
