{ describe, it } = require '../'
assert = require 'assert'

add = (a, b) => a + b
mul = (a, b) => a * b

describe 'add', =>
  it '12 + 13 = 25', =>
    sum = add 12, 13
    assert sum is 25

describe 'mul', =>
  it '12 * 13 = 156', =>
    product = mul 12, 13
    assert product is 156
