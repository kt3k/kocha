const assert = require('power-assert')

const { describe, it } = require('../../src')

const add = (a, b) => a + b
const mul = (a, b) => a * b

describe('add', () => {
  it('12 + 13 = 25', () => {
    const sum = add(12, 13)
    assert(sum === 25)
  })
})
describe('mul', () => {
  it('12 * 13 = 156', () => {
    const product = mul(12, 13)
    assert(product === 156)
  })
})
