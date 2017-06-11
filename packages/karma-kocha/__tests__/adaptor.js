const { EventEmitter } = require('events')
const assert = require('power-assert')
const td = require('testdouble')
const adaptor = require('../adaptor')
const kocha = require('kocha')
const { setUp, formatError, processAssertionError, bindContextKarmaToKochaRunner } = adaptor

describe('adaptor', () => {
  afterEach(() => {
    td.reset()
  })

  describe('setUp', () => {
    it('sets up the start method to the context karma', () => {
      const karma = {}
      const kochaFactory = () => ({})

      setUp(karma, kochaFactory)

      assert(typeof karma.start === 'function')
    })

    describe('generated start method', () => {
      it('throws when the kocha is not avaialble', () => {
        const karma = {}
        const kochaFactory = () => {}

        setUp(karma, kochaFactory)

        assert.throws(() => {
          karma.start()
        }, Error, /No kocha test cases are found!/)
      })

      it('binds the context karma to kocha runner and run it', () => {
        td.replace(adaptor, 'bindContextKarmaToKochaRunner')
        const runner = { run: td.function() }

        const karma = {}
        const kocha = { getRunner: () => runner }
        const kochaFactory = () => kocha

        setUp(karma, kochaFactory)

        karma.start()

        td.verify(adaptor.bindContextKarmaToKochaRunner(karma, runner, kocha))
        td.verify(runner.run())
      })
    })
  })

  describe('formatError', () => {
    it('returns message + stack if message is not in stack', () => {
      const stack = 'foo\n'
      const message = 'bar'

      assert.strictEqual(formatError({ stack, message }), 'bar\nfoo\n')
    })

    it('returns stack if message is in stack', () => {
      const stack = 'bar\nfoo\n'
      const message = 'bar'

      assert.strictEqual(formatError({ stack, message }), 'bar\nfoo\n')
    })

    it('returns message if stack is unavailable', () => {
      const stack = null
      const message = 'bar'

      assert.strictEqual(formatError({ stack, message }), 'bar')
    })
  })

  describe('processAssertionError', () => {
    it('process the assertion error', () => {
      const processedError = processAssertionError({
        name: 'foo',
        message: 'An error',
        expected: { foo: 1 },
        actual: { bar: 2 },
        showDiff: true
      }, kocha.stringify)

      assert.deepStrictEqual(processedError, {
        name: 'foo',
        message: 'An error',
        expected: 'Object{foo:1}',
        actual: 'Object{bar:2}',
        showDiff: true
      })
    })
  })

  describe('bindContextKarmaToKochaRunner', () => {
    it('binds the context karma to kocha runner', () => {
      const runner = { on: td.function() }
      const karma = {}

      bindContextKarmaToKochaRunner(karma, runner, kocha)

      td.verify(runner.on('start', td.matchers.isA(Function)))
      td.verify(runner.on('end', td.matchers.isA(Function)))
      td.verify(runner.on('test', td.matchers.isA(Function)))
      td.verify(runner.on('fail', td.matchers.isA(Function)))
      td.verify(runner.on('test end', td.matchers.isA(Function)))
    })

    describe('on start, the context karma', () => {
      it('info the total number of tests', () => {
        const runner = new EventEmitter()
        const karma = { info: td.function() }

        runner.total = 3

        bindContextKarmaToKochaRunner(karma, runner, kocha)

        runner.emit('start', runner)

        td.verify(karma.info({ total: 3 }))
      })
    })

    describe('on end, the context karma', () => {
      it('completes the context karma with coverage data', () => {
        const runner = new EventEmitter()
        const karma = { complete: td.function() }

        bindContextKarmaToKochaRunner(karma, runner, kocha)

        runner.emit('end', runner)

        td.verify(karma.complete({ coverage: undefined }))
      })
    })

    describe('on test, the context karma', () => {
      it('sets up the test object', () => {
        const runner = new EventEmitter()
        const karma = {}
        const test = {}

        bindContextKarmaToKochaRunner(karma, runner, kocha)

        runner.emit('test', test)

        assert(typeof test.$startTime === 'number')
        assert.deepStrictEqual(test.$errors, [])
        assert.deepStrictEqual(test.$assertionErrors, [])
      })
    })

    describe('on fail, the context karma', () => {
      it('sets up the error on the test object', () => {
        const runner = new EventEmitter()
        const karma = {}
        const test = {}

        bindContextKarmaToKochaRunner(karma, runner, kocha)

        runner.emit('fail', test, new Error('foo'))

        assert.strictEqual(test.$errors.length, 1)
        assert.strictEqual(test.$assertionErrors.length, 1)
      })

      it('emits test end event if the type is hook', done => {
        const runner = new EventEmitter()
        const karma = { result () {} }
        const test = { type: 'hook', parent: { root: true } }

        bindContextKarmaToKochaRunner(karma, runner, kocha)

        runner.on('test end', () => done())

        runner.emit('fail', test, new Error('foo'))
      })
    })

    describe('on test end, the context karma', () => {
      it('reports the result', () => {
        const runner = new EventEmitter()
        const karma = { result: td.function() }
        const test = { type: 'hook', parent: { parent: { root: true } }, pending: true }

        bindContextKarmaToKochaRunner(karma, runner, kocha)

        runner.emit('test end', test)

        td.verify(karma.result(td.matchers.isA(Object)))
      })
    })
  })
})
