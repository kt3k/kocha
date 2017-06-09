const TestRunnableNode = require('./test-runnable-node')

const EVENT_START = 'hook'
const EVENT_END = 'hook end'

/**
 * The test hook node like before, beforeEach, after or afterEach.
 */
class TestHook extends TestRunnableNode {
  /**
   * @param {Function} hook The hook impl
   * @param {TestSuite} parent The suite it belongs
   */
  constructor (hook, parent) {
    super('', hook, false, parent)
  }

  run () {
    this.bubbleEvent(EVENT_START, this)
    this.start()

    return super.run().then(() => {
      this.end()
      this.bubbleEvent(EVENT_END, this)
    })
  }
}

module.exports = TestHook
