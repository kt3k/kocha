const TestNode = require('./test-node')
const { runCb } = TestNode

class TestSuite extends TestNode {
  /**
   * @param {string} title The title of the test suite
   * @param {boolean} skipped True iff the suite is skipped
   * @param {Suite} parent The parent suite
   */
  constructor (title, skipped, parent) {
    super(title, skipped, parent)

    this.beforeCb = () => {}
    this.beforeEachCb = () => {}
    this.afterCb = () => {}
    this.afterEachCb = () => {}
    this.tests = []
    this.suites = []
  }

  setBeforeCb (cb) {
    this.beforeCb = cb
  }

  setBeforeEachCb (cb) {
    this.beforeEachCb = cb
  }

  setAfterEachCb (cb) {
    this.afterEachCb = cb
  }

  setAfterCb (cb) {
    this.afterCb = cb
  }

  /**
   * Adds the test suite.
   * @param {Suite} suite The test suite to add
   */
  addSuite (suite) {
    this.suites.push(suite)
  }

  /**
   * Adds the test case.
   * @param {Test} test The test case to add
   */
  addTest (test) {
    this.tests.push(test)
  }

  runBeforeEachCb () {
    if (this.parent) {
      return this.parent.runBeforeEachCb().then(() => runCb(this.beforeEachCb))
    }

    return runCb(this.beforeEachCb)
  }

  runAfterEachCb () {
    if (this.parent) {
      return runCb(this.afterEachCb).then(() => this.parent.runAfterEachCb())
    }

    return runCb(this.afterEachCb)
  }

  run () {
    this.bubbleEvent('suite', this)

    return runCb(this.beforeCb)
      .then(() => this.runTests())
      .then(() => this.runSuites())
      .then(() => runCb(this.afterCb))
      .then(() => this.bubbleEvent('suite end', this))
  }

  runTests () {
    return this.tests.reduce((prev, test) => prev.then(() => test.run()), Promise.resolve())
  }

  runSuites () {
    return this.suites.reduce((prev, suite) => prev.then(() => suite.run()), Promise.resolve())
  }
}

module.exports = TestSuite
