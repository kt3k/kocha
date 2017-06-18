(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory(global)
  } else {
    factory(global).setUp(global.__karma__, function () { return global.__kocha__ })
  }
})(this, function (global) {
  var exports = {}

  /**
   * Initialize karma's start method
   * @param {ContextKarma} karma
   * @param {Function} kochaFactory The function which returns kocha's module.exports object
   */
  exports.setUp = function (karma, kochaFactory) {
    karma.start = function () {
      var kocha = kochaFactory()

      if (!kocha) {
        throw new Error('No kocha test cases are found! require(\'kocha\') and write some tests!\nSee https://npm.im/kocha for more details.')
      }

      var runner = kocha.getRunner()

      exports.bindContextKarmaToKochaRunner(karma, runner, kocha)

      runner.run()
    }
  }

  /**
   * Retruns the string from the given error.
   * @param {Error} error
   * @return {string}
   */
  exports.formatError = function (error) {
    var stack = error.stack
    var message = error.message

    if (!stack) {
      return message
    }

    if (message && stack.indexOf(message) === -1) {
      return message + '\n' + stack
    }

    return stack
  }

  /**
   * Processes the assertion error for better display.
   * @param {Error} error_ The error object
   * @param {Function} stringify The stringify function
   * @return {Object}
   */
  exports.processAssertionError = function (error_, stringify) {
    var error = {
      name: error_.name,
      message: error_.message,
      showDiff: error_.showDiff
    }

    if (error.showDiff) {
      error.actual = stringify(error_.actual)
      error.expected = stringify(error_.expected)
    }

    return error
  }

  /**
   * Binds the kocha runner events to context karma.
   *
   * The context karma source: https://github.com/karma-runner/karma/blob/master/context/karma.js
   * The kocha runner source: https://github.com/kt3k/kocha/blob/master/src/test-runner.js
   *
   * @param {TestRunner} runner The test runner of kocha
   * @param {ContextKarma} karma The context karma object
   * @param {Object} kocha kocha's exports object
   */
  exports.bindContextKarmaToKochaRunner = function (karma, runner, kocha) {
    runner.on('start', function () {
      karma.info({ total: runner.total })
    })

    runner.on('end', function () {
      karma.complete({ coverage: global.__coverage__ })
    })

    runner.on('test', function (test) {
      test.$startTime = +new Date()
      test.$errors = []
      test.$assertionErrors = []
    })

    runner.on('fail', function (test, error) {
      var simpleError = exports.formatError(error, kocha)
      var assertionError = exports.processAssertionError(error, kocha.stringify)

      test.$errors = test.$errors || []
      test.$assertionErrors = test.$assertionErrors || []

      test.$errors.push(simpleError)
      test.$assertionErrors.push(assertionError)

      if (test.type === 'hook') {
        runner.emit('test end', test)
      }
    })

    runner.on('test end', function (test) {
      var skipped = test.pending === true

      var result = {
        id: '',
        description: test.title,
        suite: [],
        success: test.state === 'passed',
        skipped: skipped,
        pending: skipped,
        time: skipped ? 0 : test.duration,
        log: test.$errors || [],
        assertionErrors: test.$assertionErrors || [],
        startTime: test.$startTime,
        endTime: +new Date()
      }

      var pointer = test.parent
      while (!pointer.root) {
        result.suite.unshift(pointer.title)
        pointer = pointer.parent
      }

      karma.result(result)
    })
  }

  return exports
})
