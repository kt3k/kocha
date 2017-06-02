const td = require('testdouble')
const assert = require('power-assert')
const tencha = require('../')
const runner = tencha.runner

describe('Runner', t => {
  afterEach(() => {
    td.reset()
    runner.clear()
  })

  describe('run', () => {
    it('runs the tests and emits start, end, suite and `suite end` events', () => {
      td.replace(runner, 'emit')

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('suite', runner))
        td.verify(runner.emit('suite end', runner))
        td.verify(runner.emit('end'))
      })
    })
  })

  describe('describe', () => {
    it('registers the test suite and emits suite event with it', () => {
      td.replace(runner, 'emit')

      tencha.describe('title', () => {})

      const suite = runner.suites[0]

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('suite', runner))
        td.verify(runner.emit('suite', suite))
        td.verify(runner.emit('suite end', suite))
        td.verify(runner.emit('suite end', runner))
        td.verify(runner.emit('end'))
      })
    })

    it('constructs the test suite structure according to the nesting of describe calls', () => {
      tencha.describe('foo', () => {
        tencha.describe('bar', () => {
          tencha.describe('baz', () => {
          })
        })
        tencha.describe('quux', () => {
        })
      })

      assert(runner.suites[0].title === 'foo')
      assert(runner.suites[0].suites[0].title === 'bar')
      assert(runner.suites[0].suites[1].title === 'quux')
      assert(runner.suites[0].suites[0].suites[0].title === 'baz')
    })
  })

  describe('it', () => {
    it('registers the test case and emits `test end` and `pass` event when the test passes', () => {
      td.replace(runner, 'emit')

      tencha.it('foo', () => {})

      const test = runner.tests[0]

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('suite', runner))
        td.verify(runner.emit('test end', test))
        td.verify(runner.emit('pass', test))
        td.verify(runner.emit('suite end', runner))
        td.verify(runner.emit('end'))
      })
    })

    it('registers the test case and emits `test end` and `fail` event when the test fails', () => {
      td.replace(runner, 'emit')

      tencha.it('foo', () => { throw new Error('foo') })

      const test = runner.tests[0]

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('suite', runner))
        td.verify(runner.emit('test end', test))
        td.verify(runner.emit('fail', test, td.matchers.isA(Error)))
        td.verify(runner.emit('suite end', runner))
        td.verify(runner.emit('end'))
      })
    })

    it('registers the async test case and emit pass event when the done is called', () => {
      td.replace(runner, 'emit')

      tencha.it('foo', done => { setTimeout(() => done(), 100) })

      const test = runner.tests[0]

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('suite', runner))
        td.verify(runner.emit('test end', test))
        td.verify(runner.emit('pass', test))
        td.verify(runner.emit('suite end', runner))
        td.verify(runner.emit('end'))
      })
    })

    it('registers the async test case and emit fail event when the done is called with error object', () => {
      td.replace(runner, 'emit')

      const error = new Error('abc')

      tencha.it('foo', done => { setTimeout(() => done(error), 100) })

      const test = runner.tests[0]

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('suite', runner))
        td.verify(runner.emit('test end', test))
        td.verify(runner.emit('fail', test, error))
        td.verify(runner.emit('suite end', runner))
        td.verify(runner.emit('end'))
      })
    })

    it('registers the async test case and emit fail event when the done is called with non-error non-null object', () => {
      td.replace(runner, 'emit')

      tencha.it('foo', done => { setTimeout(() => done({}), 100) })

      const test = runner.tests[0]

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('suite', runner))
        td.verify(runner.emit('test end', test))
        td.verify(runner.emit('fail', test, td.matchers.isA(Error)))
        td.verify(runner.emit('suite end', runner))
        td.verify(runner.emit('end'))
      })
    })

    it('constructs the test suite structure according to the calls', () => {
      tencha.it('foo', () => {})

      tencha.describe('bar', () => {
        tencha.it('baz', () => {})

        tencha.describe('spam', () => {
          tencha.it('ham', () => {})
        })
      })

      assert(runner.tests[0].title === 'foo')
      assert(runner.suites[0].tests[0].title === 'baz')
      assert(runner.suites[0].suites[0].tests[0].title === 'ham')
    })

    describe('emitted test', () => {
      describe('fullTitle', () => {
        it('returns the full title', () => {
          let testCase

          tencha.describe('foo', () => {
            tencha.it('bar', () => {})
          })

          runner.on('pass', test => {
            testCase = test
          })

          return runner.run().then(() => {
            assert(testCase.fullTitle() === 'foo bar')
          })
        })
      })

      describe('timeout', () => {
        it('returns the timeout duration of the test case', () => {
          let testCase

          tencha.describe('foo', () => {
            tencha.it('bar', () => {})
          })

          runner.on('pass', test => {
            testCase = test
          })

          return runner.run().then(() => {
            assert(testCase.timeout() === 2000)
          })
        })
      })

      describe('slow', () => {
        it('returns the slow threshold of the test case', () => {
          let testCase

          tencha.describe('foo', () => {
            tencha.it('bar', () => {})
          })

          runner.on('pass', test => {
            testCase = test
          })

          return runner.run().then(() => {
            assert(testCase.slow() === 1000)
          })
        })
      })
    })
  })
})
