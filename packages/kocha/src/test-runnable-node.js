'use strict'

const TestNode = require('./test-node')

const Const = require('./const')

const EVENT = Const.EVENT
const runCb = TestNode.runCb
const throwAfterTimeout = TestNode.throwAfterTimeout

/**
 * The runnable node of the test tree.
 *
 * The parent class of TestCase and TestHook.
 */

class TestRunnableNode extends TestNode {
  /**
   * @param {string} title The title of the runnable node
   * @param {Function} runnable The function which represents the contents of the runnable
   * @param {boolean} skipped True iff the runnable node is skipped
   * @param {TestSuite} parent The parent suite
   */
  constructor (title, runnable, skipped, parent) {
    super(title, skipped, parent)

    this.runnable = runnable
    this.startedAt = 0
    this.endedAt = 0
    this.duration = 0
    this.failCount = 0
    this.failed = false
    this.state = null
  }

  /**
   * Returns the timeout duration of the test.
   * @return {number}
   */
  timeout () {
    return this.getTimeout()
  }

  /**
   * Fails the node with the given error.
   * @param {Error} e The error
   */
  fail (e) {
    this.failed = true
    this.state = 'failed'
    this.bubbleEvent(EVENT.FAIL, this, e)
  }

  start () {
    this.startedAt = +new Date()
    this.getRunner().setRunningNode(this)
  }

  end () {
    this.endedAt = +new Date()
    this.duration = this.endedAt - this.startedAt
    this.getRunner().setRunningNode(null)
  }

  /**
   * Returns the threshold number by which the test case is considered slow.
   *
   * I/F for Reporter
   * @return {number}
   */
  slow () {
    return 75
  }

  /**
   * Runs the runnable.
   *
   * Gets the timeout and retry count after starting running the runnable. The user can set them inside test cases or hooks.
   */
  run () {
    if (!this.runnable) {
      return
    }

    const promise = runCb(this.runnable, () => {
      this.fail(new Error('done() called multiple times'))
    })

    const timeout = this.getTimeout()

    const promiseWithTimeout = Promise.race([promise, throwAfterTimeout(timeout), this.getRunner().getUncaughtPromise()])

    return promiseWithTimeout.catch(e => {
      this.failCount += 1

      if (this.failCount <= this.getRetryCount()) {
        return this.run()
      }

      throw e
    })
  }
}

module.exports = TestRunnableNode
