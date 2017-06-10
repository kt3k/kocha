const kocha = require('kocha')
const describe = kocha.describe
const it = kocha.it
const assert = require('power-assert')

const add = function (a, b) { return a + b }

describe('add', function () {
  it('12 + 13 = 25', function () {
    const sum = add(12, 13)

    assert.equal(sum, 25)
  })
})
