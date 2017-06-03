const TestNode = require('./test-node')
const { runCb } = TestNode

class TestCase extends TestNode {
  /**
   * @param {string} title The title of the test case
   * @param {Function} test The function which implements the test case
   * @param {boolean} skipped True iff the case is skipped
   * @param {TestSuite} parent The parent suite
   */
  constructor (title, test, skipped, parent) {
    super(title, skipped, parent)
    this.test = test
    this.state = null
    this.pending = true
  }

  /**
   * Returns the timeout duration of the test.
   * @return {number}
   */
  timeout () {
    return this.getTimeout()
  }

  fail (e) {
    this.pending = false
    this.state = 'failed'
    this.parent.bubbleEvent('fail', this, e)
    this.parent.bubbleEvent('test end', this)
  }

  pass () {
    this.pending = false
    this.state = 'passed'
    this.parent.bubbleEvent('pass', this)
    this.parent.bubbleEvent('test end', this)
  }

  skip () {
    this.pending = true
    this.state = 'pending'
    this.parent.bubbleEvent('pending', this)
    this.parent.bubbleEvent('test end', this)
  }

  /**
   * Returns the threshold number by which the test case is considered slow.
   *
   * I/F for Reporter
   * @return {number}
   */
  slow () {
    return 1000
  }

  /**
   * Runs the test case.
   * @return {Promise}
   */
  run () {
    if (this.isSkipped()) {
      this.skip()

      return Promise.resolve()
    }

    return this.parent.runBeforeEachCb()
      .then(() => runCb(this.test))
      .then(() => { this.pass() }, e => { this.fail(e) })
      .then(() => this.parent.runAfterEachCb())
  }
}

module.exports = TestCase
