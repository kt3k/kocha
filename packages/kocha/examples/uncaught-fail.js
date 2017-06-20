const it = require('../').it

it('Uncaught error 1', done => {
  setTimeout(() => {
    throw new Error('foo')
  }, 0)
})

it('Uncaught error 2', done => {
  setTimeout(() => {
    throw new Error('bar')
  }, 0)
})

it('Uncaught error 3', done => {
  setTimeout(() => {
    throw new Error('baz')
  }, 0)
})
