const { EventEmitter } = require('events')

const wait = dur => new Promise(resolve => setTimeout(resolve, dur))

/**
 * @param {Function} cb The callback function
 * @return {boolean}
 */
const isAsyncCb = cb => cb.length > 0

/**
 * @param {Function} func The callback function
 * @return {Promise}
 */
const runAsyncCb = func => new Promise((resolve, reject) => func(result => {
  if (result instanceof Error) { return reject(result) }
  if (result) { return reject(new Error(`done() invoked with non-Error: ${result}`)) }

  resolve()
}))

/**
 * @param {Function} cb The callback function
 * @return {Promise}
 */
const runCb = cb => {
  if (isAsyncCb(cb)) {
    return runAsyncCb(cb)
  }

  try {
    return Promise.resolve(cb())
  } catch (e) {
    return Promise.reject(e)
  }
}

const throwAfterTimeout = timeout => wait(timeout).then(() => {
  throw new Error(`Timeout of ${timeout}ms exceeded. For async tests and hooks, ensure "done()" is called; if returning a Promise, ensure it resolves.`)
})

class TestNode extends EventEmitter {
  /**
   * @param {string} title The title of the test suite
   * @param {boolean} skipped True iff the suite is skipped
   * @param {Suite} parent The parent suite
   */
  constructor (title, skipped, parent) {
    super()

    this.title = title
    this.skipped = skipped
    this.parent = parent
    this.root = parent == null // True if root suite
    this.timeoutDuration = null
    this.retryCount = 0
  }

  /**
   * Returns true if skipped node.
   * @return {boolean}
   */
  isSkipped () {
    if (this.parent) {
      return this.skipped || this.parent.isSkipped()
    }

    return this.skipped
  }

  getRunner () {
    return this.parent ? this.parent.getRunner() : this
  }

  /**
   * Gets the retry count.
   * @return {number}
   */
  getRetryCount () {
    if (this.parent) {
      return this.retryCount || this.parent.getRetryCount()
    }

    return this.retryCount
  }

  /**
   * Sets the retry count.
   * @param {number} n The retry count
   */
  setRetryCount (n) {
    this.retryCount = n
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
    } else if (err) {
      this.emit(event, arg, err)
    } else if (arg) {
      this.emit(event, arg)
    } else {
      this.emit(event)
    }
  }

  setTimeout (timeout) {
    this.timeoutDuration = timeout
  }

  /**
   * Returns the timeout of the node.
   * @return {number}
   */
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
}

module.exports = TestNode
module.exports.runCb = runCb
module.exports.throwAfterTimeout = throwAfterTimeout
