'use strict'

const TestRunnableNode = require('./test-runnable-node')

const EVENT_START = 'hook'
const EVENT_END = 'hook end'

/**
 * The test hook node like before, beforeEach, after or afterEach.
 */
class TestHook extends TestRunnableNode {
  /**
   * @param {string} title The title
   * @param {Function} hook The hook impl
   * @param {TestSuite} parent The suite it belongs
   */
  constructor (title, hook, parent) {
    super(title, hook, false, parent)

    this.type = 'hook'
  }

  run () {
    this.bubbleEvent(EVENT_START, this)
    this.start()

    return super.run().catch(e => {
      this.fail(e)
    }).then(() => {
      this.end()
      this.bubbleEvent(EVENT_END, this)

      return !this.failed
    })
  }
}

module.exports = TestHook
