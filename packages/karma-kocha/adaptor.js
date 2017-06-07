window.__karma__.start = function (config) {
  var kocha = window.__kocha__

  if (!kocha) {
    throw new Error('No kocha test cases are found! require(\'kocha\') and write some tests!')
  }

  var runner = window.__kocha__.getRunner()

  bindKochaRunnerEventsToContextKarma(runner, window.__karma__)

  runner.run()
}

var bindKochaRunnerEventsToContextKarma = (function () {
  var includes = function (collection, element, startIndex) {
    if (!collection || !collection.length) {
      return false
    }

    // strings support indexOf already
    if (typeof collection === 'string') {
      return collection.indexOf(element, startIndex) !== -1
    }

    if (Array.prototype.indexOf) {
      return collection.indexOf(element, startIndex) !== -1
    }

    for (var i = startIndex || 0, len = collection.length; i < len; i++) {
      if (collection[i] === element) {
        return true
      }
    }
  }

  var formatError = function (error) {
    var stack = error.stack
    var message = error.message

    if (stack) {
      if (message && !includes(stack, message)) {
        stack = message + '\n' + stack
      }

      // remove mocha stack entries
      return stack.replace(/\n.+\/mocha\/mocha\.js\?\w*:[\d:]+\)?(?=(\n|$))/g, '')
    }

    return message
  }

  var processAssertionError = function (error_) {
    var error

    error = {
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
  var bindKochaRunnerEventsToContextKarma = function (runner, karma) {
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
      var simpleError = formatError(error)
      var assertionError = processAssertionError(error)

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

  return bindKochaRunnerEventsToContextKarma
}())
