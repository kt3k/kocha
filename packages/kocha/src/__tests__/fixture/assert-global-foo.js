'use strict'

const assert = require('assert')
const it = require('../..').it

it('global foo is defined', () => {
  assert(global.foo != null)
})
