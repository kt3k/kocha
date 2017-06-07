const { describe, it } = require('../../..')
const assert = require('power-assert')

const add = (a, b) => a + b

describe('add', () => {
  it('12 + 13 = 25', () => {
    const sum = add(12, 13)

    assert.equal(sum, 25)
  })
})
