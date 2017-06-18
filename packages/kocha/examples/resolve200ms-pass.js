const { it } = require('../')

it('resolves in 200ms', done => {
  setTimeout(() => done(), 200)
})
