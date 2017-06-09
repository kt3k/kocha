const TestNode = require('./test-node')

class TestSuite extends TestNode {
  /**
   * @param {string} title The title of the test suite
   * @param {boolean} skipped True iff the suite is skipped
   * @param {Suite} parent The parent suite
   */
  constructor (title, skipped, parent) {
    super(title, skipped, parent)

    this.beforeHook = null
    this.beforeEachHook = null
    this.afterHook = null
    this.afterEachHook = null
    this.tests = []
    this.suites = []
  }

  /**
   * Gets the total count of the tests.
   * @return {number}
   */
  getTotal () {
    return this.tests.length + this.suites.reduce((sum, suite) => sum + suite.getTotal(), 0)
  }

  /**
   * @param {TestHook} hook
   */
  setBeforeHook (hook) {
    this.beforeHook = hook
  }

  /**
   * @param {TestHook} hook
   */
  setBeforeEachHook (hook) {
    this.beforeEachHook = hook
  }

  /**
   * @param {TestHook} hook
   */
  setAfterEachHook (hook) {
    this.afterEachHook = hook
  }

  /**
   * @param {TestHook} hook
   */
  setAfterHook (hook) {
    this.afterHook = hook
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

  runBeforeHook () {
    return this.beforeHook ? this.beforeHook.run() : Promise.resolve()
  }

  runBeforeEachHooks () {
    let promise = Promise.resolve()

    if (this.parent) {
      promise = this.parent.runBeforeEachHooks()
    }

    return promise.then(() => this.beforeEachHook && this.beforeEachHook.run())
  }

  runAfterHook () {
    return this.afterHook ? this.afterHook.run() : Promise.resolve()
  }

  runAfterEachHooks () {
    let promise = this.afterEachHook ? this.afterEachHook.run() : Promise.resolve()

    if (this.parent) {
      promise = promise.then(() => this.parent.runAfterEachHooks())
    }

    return promise
  }

  run () {
    if (!this.root) {
      this.bubbleEvent('suite', this)
    }

    return this.runBeforeHook()
      .then(() => this.runTests())
      .then(() => this.runSuites())
      .then(() => this.runAfterHook())
      .then(() => {
        if (!this.root) {
          this.bubbleEvent('suite end', this)
        }
      })
  }

  runTests () {
    return this.tests.reduce((prev, test) => prev.then(() => test.run()), Promise.resolve())
  }

  runSuites () {
    return this.suites.reduce((prev, suite) => prev.then(() => suite.run()), Promise.resolve())
  }
}

module.exports = TestSuite
