const TestNode = require('./test-node')
const TestSuite = require('./test-suite')
const TestCase = require('./test-case')
const TestRunner = require('./test-runner')
const { runCb } = TestNode

const runner = new TestRunner()

exports.runner = runner

exports.describe = (title, cb) => {
  runner.describe(title, cb, false)
}

exports.describe.skip = (title, cb) => {
  runner.describe(title, cb, true)
}

exports.it = (description, cb) => {
  runner.it(description, cb, false)
}

exports.it.skip = (description, cb) => {
  runner.it(description, cb, true)
}

exports.before = cb => {
  runner.before(cb)
}

exports.beforeEach = cb => {
  runner.beforeEach(cb)
}

exports.after = cb => {
  runner.after(cb)
}

exports.afterEach = cb => {
  runner.afterEach(cb)
}

exports.timeout = timeout => {
  runner.timeout(timeout)
}

exports.TestSuite = TestSuite
exports.TestCase = TestCase
exports.TestRunner = TestRunner
