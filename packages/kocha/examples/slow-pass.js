const describe = require('../').describe
const it = require('../').it

describe('slow example', () => {
  it('passes slowly', done => {
    setTimeout(() => done(), 200)
  })
  it('passes medium slowly', done => {
    setTimeout(() => done(), 60)
  })
})
