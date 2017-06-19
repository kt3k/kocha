'use strict'

const kocha = require('../')
const describe = kocha.describe
const before = kocha.before
const beforeEach = kocha.beforeEach
const after = kocha.after
const afterEach = kocha.afterEach
const it = kocha.it
const assert = require('power-assert')

let b = 0
let be = 0
let a = 0
let ae = 0

before(() => {
  b += 1
})
beforeEach(() => {
  be += 1
})
after(() => {
  a += 1
})
afterEach(() => {
  ae += 1
})
describe('node 0', () => {
  it('test 0', () => {
    assert.equal(b, 1)
    assert.equal(be, 1)
    assert.equal(a, 0)
    assert.equal(ae, 0)
  })
  describe('node 1', () => {
    it('test 1', () => {
      assert.equal(b, 1)
      assert.equal(be, 2)
      assert.equal(a, 0)
      assert.equal(ae, 1)
    })
  })
})
