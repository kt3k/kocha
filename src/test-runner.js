const TestSuite = require('./test-suite')
const TestCase = require('./test-case')

class TestRunner extends TestSuite {
  constructor () {
    super('root', false, null)

    this.timeoutDuration = 2000
    this.currentSuite = this
  }

  describe (title, cb, skipped) {
    const parent = this.currentSuite
    const child = new TestSuite(title, skipped, parent)
    parent.addSuite(child)
    this.currentSuite = child
    cb()
    this.currentSuite = parent
  }

  it (description, cb, skipped) {
    this.currentSuite.addTest(new TestCase(description, cb, skipped, this.currentSuite))
  }

  before (cb) {
    this.currentSuite.setBeforeCb(cb)
  }

  beforeEach (cb) {
    this.currentSuite.setBeforeEachCb(cb)
  }

  after (cb) {
    this.currentSuite.setAfterCb(cb)
  }

  afterEach (cb) {
    this.currentSuite.setAfterEachCb(cb)
  }

  timeout (timeout) {
    this.currentSuite.setTimeout(timeout)
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
