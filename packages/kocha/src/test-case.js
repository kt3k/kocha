const TestRunnableNode = require('./test-runnable-node')

const EVENT_START = 'test'
const EVENT_END = 'test end'
const EVENT_PASS = 'pass'
const EVENT_FAIL = 'fail'
const EVENT_PENDING = 'pending'

class TestCase extends TestRunnableNode {
  /**
   * @param {string} title The title of the test case
   * @param {Function} test The function which implements the test case
   * @param {boolean} skipped True iff the case is skipped
   * @param {TestSuite} parent The parent suite
   */
  constructor (title, test, skipped, parent) {
    super(title, test, skipped, parent)

    this.type = 'test'
    this.passed = false
    this.failed = false
    this.pending = false
    this.state = null
  }

  fail (e) {
    this.end()
    this.failed = true
    this.state = 'failed'
    this.bubbleEvent(EVENT_FAIL, this, e)
    this.bubbleEvent(EVENT_END, this)
  }

  pass () {
    this.end()
    this.passed = true
    this.state = 'passed'
    this.bubbleEvent(EVENT_PASS, this)
    this.bubbleEvent(EVENT_END, this)
  }

  skip () {
    this.end()
    this.pending = true
    this.bubbleEvent(EVENT_PENDING, this)
    this.bubbleEvent(EVENT_END, this)
  }

  /**
   * Runs the test case.
   * @return {Promise|undefined}
   */
  run () {
    this.bubbleEvent(EVENT_START, this)
    this.start()

    if (this.isSkipped()) {
      this.skip()
      return Promise.resolve()
    }

    return this.parent.runBeforeEachHooks()
      .then(passed => {
        if (!passed) {
          return
        }

        return super.run().then(() => this.pass(), e => this.fail(e))
      })
      .then(() => this.parent.runAfterEachHooks())
  }
}

module.exports = TestCase
