import { describe, it } from '../'
import assert from 'power-assert'

const add = (a, b) => a + b

describe('add', () => {
  it('12 + 13 = 25', () => {
    assert.equal(add(12, 13), 25)
  })
})
