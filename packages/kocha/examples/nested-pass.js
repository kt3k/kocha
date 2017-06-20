'use strict'

const describe = require('../').describe
const it = require('../').it

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
