'use strict'

const it = require('../').it

it('fails', done => {
  setTimeout(() => {
    done()
    done()
  }, 100)
})
