const TestRunnableNode = require('./test-runnable-node')

class TestCase extends TestRunnableNode {
  /**
   * @param {string} title The title of the test case
   * @param {Function} test The function which implements the test case
   * @param {boolean} skipped True iff the case is skipped
   * @param {TestSuite} parent The parent suite
   */
  constructor (title, test, skipped, parent) {
    super(title, test, 'test', skipped, parent)

    this.pending = true
    this.state = null
  }

  fail (e) {
    this.calcDuration()
    this.pending = false
    this.state = 'failed'
    this.bubbleEvent('fail', this, e)
  }

  pass () {
    this.calcDuration()
    this.pending = false
    this.state = 'passed'
    this.bubbleEvent('pass', this)
  }

  skip () {
    this.calcDuration()
    this.pending = true
    this.bubbleEvent('pending', this)
  }

  /**
   * Runs the test case.
   * @return {Promise|undefined}
   */
  run () {
    this.start()

    if (this.isSkipped()) {
      this.skip()
      this.end()

      return
    }

    return this.parent.runBeforeEachCb()
      .then(() => super.run())
      .then(() => { this.pass() }, e => { this.fail(e) })
      .then(() => { this.end() })
      .then(() => this.parent.runAfterEachCb())
  }
}

module.exports = TestCase
