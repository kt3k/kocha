const { EventEmitter } = require('events')

/**
 * @param {Function} cb The callback function
 * @return {boolean}
 */
const isAsyncCb = cb => cb.length > 0

/**
 * @param {Function} cb The callback function
 * @return {Promise}
 */
const runAsyncCb = cb => new Promise(resolve => cb(result => {
  if (result instanceof Error) { throw result }
  if (result) { throw new Error(`done() invoked with non-Error: ${result}`) }

  resolve()
}))

/**
 * @param {Function} cb The callback function
 * @return {Promise}
 */
const runCb = cb => isAsyncCb(cb) ? runAsyncCb(cb) : Promise.resolve(cb())


class Suite extends EventEmitter {
  /**
   * @param {string} title The title of the test suite
   * @param {boolean} skipped True iff the suite is skipped
   * @param {Suite} parent The parent suite
   */
  constructor (title, skipped, parent) {
    super()

    this.title = title
    this.beforeCb = () => {}
    this.beforeEachCb = () => {}
    this.afterCb = () => {}
    this.afterEachCb = () => {}
    this.tests = []
    this.suites = []
    this.skipped = skipped
    this.parent = parent
    this.root = parent == null // True if root suite
  }

  isSkipped () {
    if (this.parent) {
      return this.skipped || this.parent.isSkipped()
    }

    return this.skipped
  }

  /**
   * Bubbles the event to the parent suite.
   * @param {string} event The event name
   * @param {any} arg The argument
   * @param {Error?} err The error object
   */
  bubbleEvent (event, arg, err) {
    if (this.parent) {
      this.parent.bubbleEvent(event, arg, err)
    } else {
      this.emit(event, arg, err)
    }
  }

  setBeforeCb (cb) {
    this.beforeCb = cb
  }

  setBeforeEachCb (cb) {
    this.beforeEachCb = cb
  }

  setAfterEachCb (cb) {
    this.afterEachCb = cb
  }

  setAfterCb (cb) {
    this.afterCb = cb
  }

  /**
   * Adds the test suite.
   * @param {Suite} suite The test suite to add
   */
  addSuite (suite) {
    this.suites.push(suite)
  }

  /**
   * Adds the test case.
   * @param {Test} test The test case to add
   */
  addTest (test) {
    this.tests.push(test)
  }

  setTimeout (timeout) {
    this.timeoutDuration = timeout
  }

  getTimeout () {
    return typeof this.timeoutDuration === 'number' ? this.timeoutDuration : this.parent.getTimeout()
  }

  /**
   * Returns the full title including the parent's title.
   */
  fullTitle () {
    if (this.parent.root) {
      return this.title
    }

    return `${this.parent.fullTitle()} ${this.title}`
  }


  runBeforeEachCb () {
    if (this.parent) {
      return this.parent.runBeforeEachCb().then(() => runCb(this.beforeEachCb))
    }

    return runCb(this.beforeEachCb)
  }

  runAfterEachCb () {
    if (this.parent) {
      return runCb(this.afterEachCb).then(() => this.parent.runAfterEachCb())
    }

    return runCb(this.afterEachCb)
  }

  run () {
    this.bubbleEvent('suite', this)

    return runCb(this.beforeCb)
      .then(() => this.runTests())
      .then(() => this.runSuites())
      .then(() => runCb(this.afterCb))
      .then(() => this.bubbleEvent('suite end', this))
  }

  runTests () {
    return this.tests.reduce((prev, test) => prev.then(() => test.run()), Promise.resolve())
  }

  runSuites () {
    return this.suites.reduce((prev, suite) => prev.then(() => suite.run()), Promise.resolve())
  }
}

class Macha extends Suite {
  constructor () {
    super('root', false, null)

    this.timeoutDuration = 2000
    this.currentSuite = this
  }

  describe (title, cb, skipped) {
    const parent = this.currentSuite
    const child = new Suite(title, skipped, parent)
    parent.addSuite(child)
    this.currentSuite = child
    cb()
    this.currentSuite = parent
  }

  it (description, cb, skipped) {
    this.currentSuite.addTest(new Test(description, cb, skipped, this.currentSuite))
  }

  before (cb) {
    this.currentSuite.addBeforeCb(cb)
  }

  beforeEach (cb) {
    this.currentSuite.addBeforeEachCb(cb)
  }

  after (cb) {
    this.currentSuite.addAfterCb(cb)
  }

  afterEach (cb) {
    this.currentSuite.addAfterEachCb(cb)
  }

  timeout (timeout) {
    this.currentSuite.setTimeout(timeout)
  }

  /**
   * Runs the tests. Private API.
   * @return {Promise}
   */
  run () {
    this.emit('start')
    return super.run()
      .then(() => this.emit('end'))
  }
}

class Test {
  /**
   * @param {string} title The title of the test case
   * @param {Function} test The function which implements the test case
   * @param {boolean} skipped True iff the case is skipped
   * @param {Suite} parent The parent suite
   */
  constructor (title, test, skipped, parent) {
    this.title = title
    this.test = test
    this.skipped = skipped
    this.parent = parent
    this.state = null
    this.pending = true
  }

  fail (e) {
    this.pending = false
    this.state = 'failed'
    this.parent.bubbleEvent('test end', this)
    this.parent.bubbleEvent('fail', this, e)
  }

  pass () {
    this.pending = false
    this.state = 'passed'
    this.parent.bubbleEvent('test end', this)
    this.parent.bubbleEvent('pass', this)
  }

  /**
   * Returns the timeout duration.
   * @return {number}
   */
  timeout () {
    return this.parent.getTimeout()
  }

  fullTitle () {
    if (this.parent.root) {
      return this.title
    }

    return `${this.parent.fullTitle()} ${this.title}`
  }

  /**
   * Runs the test case.
   * @return {Promise}
   */
  run () {
    return this.parent.runBeforeEachCb()
      .then(() => runCb(this.test))
      .then(() => { this.pass() }, e => { this.fail(e) })
      .then(() => this.parent.runAfterEachCb())
  }
}

const macha = new Macha()
exports.macha = macha
exports.describe = (title, cb) => { macha.describe(title, cb, false) }
exports.describe.skip = (title, cb) => { macha.describe(title, cb, true) }
exports.it = (description, cb) => { macha.it(description, cb, false) }
exports.it.skip = (description, cb) => { macha.it(description, cb, true) }
exports.before = cb => { macha.before(cb) }
exports.beforeEach= cb => { macha.beforeEach(cb) }
exports.after = cb => { macha.after(cb) }
exports.afterEach = cb => { macha.after(each) }
exports.timeout = timeout => { macha.timeout(timeout) }
