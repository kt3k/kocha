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
    this.pending = false
  }

  pass () {
    if (this.failed) {
      // If it's already failed then, do not pass it
      return
    }

    this.passed = true
    this.state = 'passed'
    this.bubbleEvent(EVENT_PASS, this)
  }

  skip () {
    this.pending = true
    this.state = 'pending'
    this.bubbleEvent(EVENT_PENDING, this)
  }

  /**
   * Runs the test case.
   * @return {Promise|undefined}
   */
  run () {
    this.bubbleEvent(EVENT_START, this)
    this.start()

    if (this.isSkipped()) {
      this.end()
      this.skip()
      this.bubbleEvent(EVENT_END, this)
      return Promise.resolve()
    }

    return this.parent.runBeforeEachHooks()
      .then(passed => {
        if (!passed) {
          return
        }

        return super.run().then(() => {
          this.end()
          this.pass()
        }, e => {
          this.end()
          this.fail(e)
        })
      })
      .then(() => this.bubbleEvent(EVENT_END, this))
      .then(() => this.parent.runAfterEachHooks())
  }
}

module.exports = TestCase
