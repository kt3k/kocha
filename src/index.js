const TestNode = require('./test-node')
const TestSuite = require('./test-suite')
const TestCase = require('./test-case')
const TestRunner = require('./test-runner')

const runner = new TestRunner()

exports.runner = runner

const addSuite = (title, cb, skipped) => {
  const parent = runner.getCurrentSuite()
  const child = new TestSuite(title, skipped, parent)

  parent.addSuite(child)

  runner.setCurrentSuite(child)

  cb()

  runner.setCurrentSuite(parent)
}

const addTest = (title, cb, skipped) => {
  const currentSuite = runner.getCurrentSuite()
  currentSuite.addTest(new TestCase(title, cb, skipped, currentSuite))
}

exports.describe = (title, cb) => {
  addSuite(title, cb, false)
}

exports.describe.skip = (title, cb) => {
  addSuite(title, cb, true)
}

exports.it = (title, cb) => {
  addTest(title, cb, false)
}

exports.it.skip = (title, cb) => {
  addTest(title, cb, true)
}

exports.before = cb => {
  runner.getCurrentSuite().setBeforeCb(cb)
}

exports.beforeEach = cb => {
  runner.getCurrentSuite().setBeforeEachCb(cb)
}

exports.after = cb => {
  runner.getCurrentSuite().setAfterCb(cb)
}

exports.afterEach = cb => {
  runner.getCurrentSuite().setAfterEachCb(cb)
}

exports.timeout = timeout => {
  runner.getCurrentSuite().setTimeout(timeout)
}

exports.TestSuite = TestSuite
exports.TestCase = TestCase
exports.TestRunner = TestRunner
