const path = require('path')
const { join } = path
const glob = require('glob')
const { statSync, existsSync } = require('fs')

/**
 * Flattens the given arrays.
 * @param {Array[]} arrays
 * @return {Array}
 */
const flatten = arrays => Array.prototype.concat.apply([], arrays)

/**
 * Looks up the all files from the given patterns and options.
 * @param {string[]} patterns The patterns
 * @param {Object} options The options
 * @return {string[]}
 */
const lookupFilesAll = (patterns, options) => flatten(patterns.map(pattern => {
  const files = lookupFiles(pattern, options)

  if (files.length === 0) {
    console.log(`Warning: Could not find any test files matching pattern: ${pattern}`)
  }

  return files
}))

/**
 * Looks up the files from the given pattern
 * @param {string[]} pattern The pattern
 * @param {Object} options The options
 */
const lookupFiles = (pattern, options) => {
  const { cwd } = options

  if (existsSync(pattern)) {
    return lookupFilesFromPath(pattern, options)
  }

  if (existsSync(pattern + '.js')) {
    return lookupFilesFromPath(pattern + '.js', options)
  }

  return lookupFilesFromGlob(pattern, options)
}

const lookupFilesFromGlob = (pattern, options) => {
  const { cwd } = options

  return glob.sync(pattern, options)
    .map(scriptPath => path.resolve(cwd, scriptPath))
}

const lookupFilesFromPath = (filepath, options) => {
  const { cwd } = options
  let stat

  try {
    stat = statSync(filepath)
  } catch (e) {
    // Path doesn't work, returns an empty array.
    return []
  }

  if (stat.isFile()) {
    return [path.resolve(cwd, filepath)]
  }

  if (stat.isDirectory()) {
    return lookupFilesFromGlob(path.join(filepath, '**/*.js'), options)
  }

  return []
}

module.exports = lookupFilesAll
