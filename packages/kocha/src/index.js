const TestSuite = require('./test-suite')
const TestCase = require('./test-case')
const TestHook = require('./test-hook')
const TestRunner = require('./test-runner')
const stringify = require('stringifier').stringify

let runner

/**
 * Gets the runner.
 * @return {TestRunner}
 */
const getRunner = exports.getRunner = () => runner

/**
 * Resets the runner.
 */
exports.resetRunner = () => { runner = new TestRunner() }
exports.resetRunner()

const addSuite = (title, cb, skipped) => {
  const parent = currentSuite()
  const child = new TestSuite(title, skipped, parent)

  parent.addSuite(child)

  getRunner().setCurrentSuite(child)

  cb()

  getRunner().setCurrentSuite(parent)
}

const addTest = (title, cb, skipped) => {
  currentSuite().addTest(new TestCase(title, cb, skipped, currentSuite()))
}

const currentSuite = () => getRunner().getCurrentSuite()

const currentNode = () => getRunner().getCurrentNode()

/**
 * Adds the test suite by the name and factory method.
 * @param {string} title The title of the suite.
 * @param {Function} cb The factory of subnodes
 */
exports.describe = exports.context = (title, cb) => {
  addSuite(title, cb, false)
}

/**
 * Adds the skipped test suite by the name and factory method.
 * @param {string} title The title of the suite.
 * @param {Function} cb The factory of subnodes
 */
exports.describe.skip = exports.xdescribe = exports.xcontext = (title, cb) => {
  addSuite(title, cb, true)
}

/**
 * Adds the test case by the name and test case function.
 * @param {string} title The title of the test case
 * @param {Function} cb The test case function
 */
exports.it = exports.specify = (title, cb) => {
  addTest(title, cb, false)
}

/**
 * Adds the skipped test case by the name and test case function.
 * @param {string} title The title of the test case
 * @param {Function} cb The test case function
 */
exports.it.skip = exports.xit = exports.xspecify = (title, cb) => {
  addTest(title, cb, true)
}

exports.before = cb => {
  currentSuite().setBeforeHook(new TestHook('"before all" hook', cb, currentSuite()))
}

exports.beforeEach = cb => {
  currentSuite().setBeforeEachHook(new TestHook('"before each" hook', cb, currentSuite()))
}

exports.after = cb => {
  currentSuite().setAfterHook(new TestHook('"after all" hook', cb, currentSuite()))
}

exports.afterEach = cb => {
  currentSuite().setAfterEachHook(new TestHook('"after each" hook', cb, currentSuite()))
}

exports.timeout = timeout => {
  currentNode().setTimeout(timeout)
}

exports.retries = n => {
  currentNode().setRetryCount(n)
}

exports.TestSuite = TestSuite
exports.TestCase = TestCase
exports.TestHook = TestHook
exports.TestRunner = TestRunner
exports.stringify = stringify

// Pretends to be ESM for transform-es2015-modules-commonjs
exports.__esModule = true

// Exports all as default
// This enables `import kocha from 'kocha'` in babel.
exports.default = exports

// Expose window.__kocha__ if the environment is browser
// This is for karma environment
if (typeof window === 'object') {
  window.__kocha__ = exports
}
