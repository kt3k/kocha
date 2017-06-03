const TestNode = require('./test-node')
const TestSuite = require('./test-suite')
const TestCase = require('./test-case')
const TestRunner = require('./test-runner')

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
  const parent = getRunner().getCurrentSuite()
  const child = new TestSuite(title, skipped, parent)

  parent.addSuite(child)

  getRunner().setCurrentSuite(child)

  cb()

  getRunner().setCurrentSuite(parent)
}

const addTest = (title, cb, skipped) => {
  const currentSuite = getRunner().getCurrentSuite()
  currentSuite.addTest(new TestCase(title, cb, skipped, currentSuite))
}

/**
 * Adds the test suite by the name and factory method.
 * @param {string} title The title of the suite.
 * @param {Function} cb The factory of subnodes
 */
exports.describe = (title, cb) => {
  addSuite(title, cb, false)
}

/**
 * Adds the skipped test suite by the name and factory method.
 * @param {string} title The title of the suite.
 * @param {Function} cb The factory of subnodes
 */
exports.describe.skip = (title, cb) => {
  addSuite(title, cb, true)
}

/**
 * Adds the test case by the name and test case function.
 * @param {string} title The title of the test case
 * @param {Function} cb The test case function
 */
exports.it = (title, cb) => {
  addTest(title, cb, false)
}

/**
 * Adds the skipped test case by the name and test case function.
 * @param {string} title The title of the test case
 * @param {Function} cb The test case function
 */
exports.it.skip = (title, cb) => {
  addTest(title, cb, true)
}

exports.before = cb => {
  getRunner().getCurrentSuite().setBeforeCb(cb)
}

exports.beforeEach = cb => {
  getRunner().getCurrentSuite().setBeforeEachCb(cb)
}

exports.after = cb => {
  getRunner().getCurrentSuite().setAfterCb(cb)
}

exports.afterEach = cb => {
  getRunner().getCurrentSuite().setAfterEachCb(cb)
}

exports.timeout = timeout => {
  getRunner().getCurrentSuite().setTimeout(timeout)
}

exports.TestSuite = TestSuite
exports.TestCase = TestCase
exports.TestRunner = TestRunner
