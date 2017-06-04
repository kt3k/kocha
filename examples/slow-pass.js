const { describe, it } = require('../')

describe('slow example', () => {
  it('passes slowly', done => {
    setTimeout(() => done(), 200)
  })
})
