const assert = require('power-assert')

const { describe, it, retries } = require('../src')

const add = (a, b) => a + b
const mul = (a, b) => a * b

describe('add', () => {
  retries(2)
  it('12 + 13 = 24', done => {
    const sum = add(12, 13)
    assert(sum === 24)
  })
})
describe('mul', () => {
  it('12 * 13 = 154', () => {
    retries(4)
    const product = mul(12, 13)
    assert(product === 154)
  })
})
