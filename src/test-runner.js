const TestSuite = require('./test-suite')
const TestCase = require('./test-case')

class TestRunner extends TestSuite {
  constructor () {
    super('root', false, null)

    this.timeoutDuration = 2000
    this.currentSuite = this
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

  /**
   * Runs the tests. Private API.
   * @return {Promise}
   */
  run () {
    this.bubbleEvent('start')
    return super.run()
      .then(() => this.bubbleEvent('end'))
  }

  clear () {
    this.tests.splice(0)
    this.suites.splice(0)
  }
}

module.exports = TestRunner
