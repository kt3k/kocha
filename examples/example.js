const assert = require('power-assert')

const { describe, it } = require('../src')

const add = (a, b) => a + b
const mul = (a, b) => a * b

describe('add', () => {
  it('12 + 13 = 25', () => {
    const sum = add(12, 13)
    assert(sum === 25)
  })
  it('12 + 13 = 24', () => {
    const sum = add(12, 13)
    assert(sum === 24)
  })
  it.skip('12 + 13 = 23', () => {
    const sum = add(12, 13)
    assert(sum === 24)
  })
})
describe.skip('mul', () => {
  it('12 * 13 = 156', () => {
    const product = mul(12, 13)
    assert(product === 156)
  })
})
