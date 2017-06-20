'use strict'

const it = require('../').it

it('resolves in 200ms', done => {
  setTimeout(() => done(), 200)
})
