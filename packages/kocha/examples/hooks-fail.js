const kocha = require('../')
const it = kocha.it
const describe = kocha.describe
const before = kocha.before
const after = kocha.after
const beforeEach = kocha.beforeEach
const afterEach = kocha.afterEach

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
