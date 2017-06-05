const td = require('testdouble')
const assert = require('power-assert')
const kocha = require('../')

let runner

describe('kocha', t => {
  beforeEach(() => {
    runner = kocha.getRunner()
  })
  afterEach(() => {
    td.reset()
    kocha.resetRunner()
  })

  describe('runner.run', () => {
    it('runs the tests and emits start and end events', () => {
      td.replace(runner, 'emit')

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('end'))
      })
    })
  })

  describe('describe', () => {
    it('registers the test suite and emits suite event with it', () => {
      td.replace(runner, 'emit')

      kocha.describe('title', () => {})

      const suite = runner.suites[0]

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('suite', suite))
        td.verify(runner.emit('suite end', suite))
        td.verify(runner.emit('end'))
      })
    })

    it('constructs the test suite structure according to the nesting of describe calls', () => {
      kocha.describe('foo', () => {
        kocha.describe('bar', () => {
          kocha.describe('baz', () => {
          })
        })
        kocha.describe('quux', () => {
        })
      })

      assert(runner.suites[0].title === 'foo')
      assert(runner.suites[0].suites[0].title === 'bar')
      assert(runner.suites[0].suites[1].title === 'quux')
      assert(runner.suites[0].suites[0].suites[0].title === 'baz')
    })
  })

  describe('describe.skip', () => {
    it('registers the skipped test suite', () => {
      kocha.describe.skip('foo', () => {})

      assert(runner.suites[0].title === 'foo')
      assert(runner.suites[0].isSkipped())
    })

    it('registers the skipped test suite and it has effect to its child suites', () => {
      kocha.describe.skip('foo', () => {
        kocha.describe('bar', () => {
        })
      })

      assert(runner.suites[0].suites[0].title === 'bar')
      assert(runner.suites[0].suites[0].isSkipped())
    })
    it('registers the skipped test suite and it does not have effect to its sibling suites', () => {
      kocha.describe.skip('foo', () => {})
      kocha.describe('bar', () => {})

      assert(runner.suites[0].title === 'foo')
      assert(runner.suites[0].isSkipped())
      assert(runner.suites[1].title === 'bar')
      assert(!runner.suites[1].isSkipped())
    })
  })

  describe('it', () => {
    it('registers the test case and emits `test end` and `pass` event when the test passes', () => {
      td.replace(runner, 'emit')

      kocha.it('foo', () => {})

      const test = runner.tests[0]

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('test end', test))
        td.verify(runner.emit('pass', test))
        td.verify(runner.emit('end'))
      })
    })

    it('registers the test case and emits `test end` and `fail` event when the test fails', () => {
      td.replace(runner, 'emit')

      kocha.it('foo', () => { throw new Error('foo') })

      const test = runner.tests[0]

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('test end', test))
        td.verify(runner.emit('fail', test, td.matchers.isA(Error)))
        td.verify(runner.emit('end'))
      })
    })

    it('registers the async test case and emit pass event when the done is called', () => {
      td.replace(runner, 'emit')

      kocha.it('foo', done => { setTimeout(() => done(), 100) })

      const test = runner.tests[0]

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('test end', test))
        td.verify(runner.emit('pass', test))
        td.verify(runner.emit('end'))
      })
    })

    it('registers the async test case and emit fail event when the done is called with error object', () => {
      td.replace(runner, 'emit')

      const error = new Error('abc')

      kocha.it('foo', done => { setTimeout(() => done(error), 100) })

      const test = runner.tests[0]

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('test end', test))
        td.verify(runner.emit('fail', test, error))
        td.verify(runner.emit('end'))
      })
    })

    it('registers the async test case and emit fail event when the done is called with non-error non-null object', () => {
      td.replace(runner, 'emit')

      kocha.it('foo', done => { setTimeout(() => done({}), 100) })

      const test = runner.tests[0]

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('test end', test))
        td.verify(runner.emit('fail', test, td.matchers.isA(Error)))
        td.verify(runner.emit('end'))
      })
    })

    it('constructs the test suite structure according to the calls', () => {
      kocha.it('foo', () => {})

      kocha.describe('bar', () => {
        kocha.it('baz', () => {})

        kocha.describe('spam', () => {
          kocha.it('ham', () => {})
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

          kocha.describe('foo', () => {
            kocha.it('bar', () => {})
          })

          runner.on('pass', test => {
            testCase = test
          })

          return runner.run().then(() => {
            assert(testCase.fullTitle() === 'foo bar')
          })
        })

        it('returns its title when registered out of any suite', () => {
          let testCase

          kocha.it('foo', () => {})

          runner.on('pass', test => {
            testCase = test
          })

          return runner.run().then(() => {
            assert(testCase.fullTitle() === 'foo')
          })
        })
      })

      describe('timeout', () => {
        it('returns the timeout duration of the test case', () => {
          let testCase

          kocha.describe('foo', () => {
            kocha.it('bar', () => {})
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

          kocha.describe('foo', () => {
            kocha.it('bar', () => {})
          })

          runner.on('pass', test => {
            testCase = test
          })

          return runner.run().then(() => {
            assert(testCase.slow() === 100)
          })
        })
      })
    })
  })

  describe('it.skip', () => {
    it('registers the skipped test case and emits `pending` and `test end` event', () => {
      td.replace(runner, 'emit')

      kocha.it.skip('foo', () => { throw new Error('foo') })

      const test = runner.tests[0]

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('pending', test))
        td.verify(runner.emit('test end', test))
        td.verify(runner.emit('end'))
      })
    })
  })

  describe('before', () => {
    it('registers before callback to each test suite', () => {
      const cb0 = () => {}
      const cb1 = () => {}

      kocha.before(cb0)

      kocha.describe('foo', () => {
        kocha.before(cb1)
      })

      assert(runner.beforeCb === cb0)
      assert(runner.suites[0].beforeCb === cb1)
    })
  })

  describe('beforeEach', () => {
    it('registers beforeEach callback to each test suite', () => {
      const cb0 = () => {}
      const cb1 = () => {}

      kocha.beforeEach(cb0)

      kocha.describe('foo', () => {
        kocha.beforeEach(cb1)
      })

      assert(runner.beforeEachCb === cb0)
      assert(runner.suites[0].beforeEachCb === cb1)
    })
  })

  describe('after', () => {
    it('registers after callback to each test suite', () => {
      const cb0 = () => {}
      const cb1 = () => {}

      kocha.after(cb0)

      kocha.describe('foo', () => {
        kocha.after(cb1)
      })

      assert(runner.afterCb === cb0)
      assert(runner.suites[0].afterCb === cb1)
    })
  })

  describe('afterEach', () => {
    it('registers afterEach callback to each test suite', () => {
      const cb0 = () => {}
      const cb1 = () => {}

      kocha.afterEach(cb0)

      kocha.describe('foo', () => {
        kocha.afterEach(cb1)
      })

      assert(runner.afterEachCb === cb0)
      assert(runner.suites[0].afterEachCb === cb1)
    })
  })

  describe('timeout', () => {
    it('sets the timeout to each test suite', () => {
      td.replace(runner, 'emit')

      kocha.timeout(123)

      kocha.describe('foo', () => {
        kocha.timeout(234)

        kocha.it('bar', done => { setTimeout(done, 300) })
      })

      assert(runner.getTimeout() === 123)
      assert(runner.suites[0].getTimeout() === 234)

      const test = runner.suites[0].tests[0]

      assert(test.getTimeout() === 234)

      return runner.run().then(() => {
        td.verify(runner.emit('start'))
        td.verify(runner.emit('fail', test, td.matchers.isA(Error)))
        td.verify(runner.emit('test end', test))
        td.verify(runner.emit('end'))
      })
    })

    it('sets the timeout to each test suite', () => {
      td.replace(runner, 'emit')

      kocha.it('bar', done => {
        kocha.timeout(200)
        setTimeout(done, 300)
      })

      kocha.it('baz', done => {
        setTimeout(done, 300)
      })

      const bar = runner.tests[0]
      const baz = runner.tests[1]

      return runner.run().then(() => {
        assert(bar.getTimeout() === 200)
        assert(baz.getTimeout() === 2000)

        td.verify(runner.emit('start'))
        td.verify(runner.emit('fail', bar, td.matchers.isA(Error)))
        td.verify(runner.emit('test end', bar))
        td.verify(runner.emit('pass', baz))
        td.verify(runner.emit('test end', baz))
        td.verify(runner.emit('end'))
      })
    })

    describe('when done() is not called during timeout', () => {
      it('fails', () => {
        td.replace(runner, 'emit')

        kocha.timeout(100)

        kocha.it('foo', done => { setTimeout(done, 200) })

        const test = runner.tests[0]

        return runner.run().then(() => {
          td.verify(runner.emit('start'))
          td.verify(runner.emit('fail', test, td.matchers.isA(Error)))
          td.verify(runner.emit('test end', test))
          td.verify(runner.emit('end'))
        })
      })
    })
  })

  describe('retries', () => {
    it('sets the retry count at suite level', () => {
      const spy = td.function()

      kocha.retries(4)

      kocha.it('foo', () => {
        spy()
        throw new Error('bar')
      })

      assert.strictEqual(runner.tests[0].getRetryCount(), 4)

      return runner.run().then(() => {
        td.verify(spy(), { times: 5 })
      })
    })

    it('sets the retry count at suite level', () => {
      const spy0 = td.function()
      const spy1 = td.function()

      kocha.it('foo', () => {
        kocha.retries(7)
        spy0()
        throw new Error('bar')
      })

      kocha.it('bar', () => {
        spy1()
        throw new Error('bar')
      })

      assert.strictEqual(runner.tests[0].getRetryCount(), 0)
      assert.strictEqual(runner.tests[1].getRetryCount(), 0)

      return runner.run().then(() => {
        assert.strictEqual(runner.tests[0].getRetryCount(), 7)
        assert.strictEqual(runner.tests[1].getRetryCount(), 0)
        td.verify(spy0(), { times: 8 })
        td.verify(spy1(), { times: 1 })
      })
    })
  })
})
