const { it, describe, before, after, beforeEach, afterEach } = require('../')

it('test 1', () => {
})

describe('suite 0', () => {
  before(() => {
    throw new Error('abc')
  })
  after(() => {
    throw new Error('abc')
  })
  it('test 2', () => {
  })
})

describe('suite 1', () => {
  beforeEach(() => {
    throw new Error('abc')
  })
  afterEach(() => {
    throw new Error('abc')
  })
  it('test 3', () => {
  })
})
