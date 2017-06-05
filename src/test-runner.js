const TestSuite = require('./test-suite')

class TestRunner extends TestSuite {
  constructor () {
    super('root', false, null)

    this.timeoutDuration = 2000
    this.currentSuite = this
    this.currentTest = null
  }

  /**
   * Returns the current suite.
   * @return {TestSuite}
   */
  getCurrentSuite () {
    return this.currentSuite
  }

  /**
   * Sets the current suite of the runner.
   * @param {TestSuite}
   */
  setCurrentSuite (suite) {
    this.currentSuite = suite
  }

  getCurrentNode () {
    return this.getCurrentTest() || this.getCurrentSuite()
  }

  /**
   * Sets the currently test case.
   * @param {TestCase} test The test case
   */
  setCurrentTest (test) {
    this.currentTest = test
  }

  /**
   * Gets the currently running test case.
   * @return {TestCase}
   */
  getCurrentTest () {
    return this.currentTest
  }

  /**
   * Runs the tests. Private API.
   * @return {Promise}
   */
  run () {
    this.bubbleEvent('start')
    return super.run()
      .then(() => this.bubbleEvent('end'))
  }
}

module.exports = TestRunner
