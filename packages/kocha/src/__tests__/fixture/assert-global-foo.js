const assert = require('assert')
const { it } = require('../..')

it('global foo is defined', () => {
  assert(global.foo != null)
})
