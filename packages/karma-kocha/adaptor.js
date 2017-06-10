(function (factory) {
  if (typeof exports === 'object' && typeof module !== undefined) {
    module.exports === factory()
  } else {
    factory()(window.__karma__, function () { return window.__kocha__ })
  }
})(function () {
  /**
   * Initialize karma's start method
   * @param {ContextKarma} karma
   * @param {Function} kochaGetter The function which returns kocha's module.exports object
   */
  var exports = function (karma, kochaGetter) {
    karma.start = function () {
      var kocha = kochaGetter()

      if (!kocha) {
        throw new Error('No kocha test cases are found! require(\'kocha\') and write some tests!\nSee https://npm.im/kocha for more details.')
      }

      var runner = kocha.getRunner()

      exports.bindKochaRunnerEventsToContextKarma(runner, karma)

      runner.run()
    }
  }

  exports.formatError = function (error) {
    var stack = error.stack
    var message = error.message

    if (stack) {
      if (message && stack.indexOf(message) === -1) {
        stack = message + '\n' + stack
      }
    }

    return message
  }

  exports.processAssertionError = function (error_) {
    var error = {
      name: error_.name,
      message: error_.message,
      showDiff: error_.showDiff
    }

    if (error.showDiff) {
      error.actual = JSON.stringify(error_.actual)
      error.expected = JSON.stringify(error_.expected)
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
   */
  exports.bindKochaRunnerEventsToContextKarma = function (runner, karma) {
    var isDebugPage = /debug.html$/.test(window.location.pathname)

    runner.on('start', function () {
      karma.info({ total: runner.total })
    })

    runner.on('end', function () {
      karma.complete({ coverage: window.__coverage__ })
    })

    runner.on('test', function (test) {
      test.$startTime = +new Date()
      test.$errors = []
      test.$assertionErrors = []
    })

    runner.on('pending', function (test) {
      test.pending = true
    })

    runner.on('fail', function (test, error) {
      var simpleError = exports.formatError(error)
      var assertionError = exports.processAssertionError(error)

      if (test.type === 'hook') {
        test.$errors = isDebugPage ? [error] : [simpleError]
        test.$assertionErrors = assertionError ? [assertionError] : []
        runner.emit('test end', test)
      } else {
        test.$errors.push(isDebugPage ? error : simpleError)
        if (assertionError) test.$assertionErrors.push(assertionError)
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
