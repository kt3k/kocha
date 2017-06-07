const { describe, it } = require('../')

describe('foo', () => {
  describe('bar', () => {
    describe('baz', () => {
      describe('qux', () => {
        it('is ok', () => {
        })
      })
    })
  })
})
