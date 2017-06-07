const TestNode = require('./test-node')
const { runCb, runCbWithTimeout, throwAfterTimeout } = TestNode

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
    this.pending = true
    this.startedAt = 0
    this.endedAt = 0
    this.duration = 0
    this.state = null
  }

  /**
   * Returns the timeout duration of the test.
   * @return {number}
   */
  timeout () {
    return this.getTimeout()
  }

  fail (e) {
    this.calcDuration()
    this.pending = false
    this.state = 'failed'
    this.bubbleEvent('fail', this, e)
    this.end()
  }

  pass () {
    this.calcDuration()
    this.pending = false
    this.state = 'passed'
    this.bubbleEvent('pass', this)
    this.end()
  }

  skip () {
    this.calcDuration()
    this.pending = true
    this.bubbleEvent('pending', this)
    this.end()
  }

  calcDuration () {
    this.endedAt = +new Date()
    this.duration = this.endedAt - this.startedAt
  }

  start () {
    this.startedAt = +new Date()
    this.getRunner().setCurrentTest(this)
    this.bubbleEvent('test', this)
  }

  end () {
    this.bubbleEvent('test end', this)
  }

  /**
   * Returns the threshold number by which the test case is considered slow.
   *
   * I/F for Reporter
   * @return {number}
   */
  slow () {
    return 100
  }

  runCb (cb) {
    const promise = runCb(cb)
    const timeout = this.getTimeout()
    const retryCount = this.getRetryCount()

    const promiseWithTimeout = Promise.race([promise, throwAfterTimeout(timeout)])

    return Array(retryCount).fill(0).reduce(promise => promise.catch(() => runCbWithTimeout(cb, timeout)), promiseWithTimeout)
  }

  /**
   * Runs the test case.
   * @return {Promise}
   */
  run () {
    this.start()
    if (this.isSkipped()) {
      this.skip()

      return Promise.resolve()
    }

    return this.parent.runBeforeEachCb()
      .then(() => this.runCb(this.test))
      .then(() => { this.pass() }, e => { this.fail(e) })
      .then(() => this.parent.runAfterEachCb())
  }
}

module.exports = TestCase
