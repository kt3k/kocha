const { execSync } = require('child_process')
const assert = require('power-assert')

describe('simple-pass example', function () {
  this.timeout(3000)
  it('passes', () => {
    execSync('./packages/kocha/bin/kocha.js ./packages/kocha/examples/simple-pass.js')
  })
})
describe('simple-fail example', () => {
  it('fails', () => {
    assert.throws(() => {
      execSync('./packages/kocha/bin/kocha.js ./packages/kocha/examples/simple-fail.js')
    }, Error)
  })
})
describe('timeout-fail example', () => {
  it('fails', () => {
    assert.throws(() => {
      execSync('./packages/kocha/bin/kocha.js ./packages/kocha/examples/timeout-fail.js')
    }, Error)
  })
})
describe('nested-pass example', () => {
  it('passes', () => {
    execSync('./packages/kocha/bin/kocha.js ./packages/kocha/examples/nested-pass.js')
  })
})
describe('slow-pass example', () => {
  it('passes', () => {
    execSync('./packages/kocha/bin/kocha.js ./packages/kocha/examples/slow-pass.js')
  })
})
describe('babel-pass example', function () {
  this.timeout(3500)
  it('passes', () => {
    execSync('./packages/kocha/bin/kocha.js --require babel-register ./packages/kocha/examples/slow-pass.js')
  })
})
describe('hooks-pass example', function () {
  it('passes', () => {
    execSync('./packages/kocha/bin/kocha.js ./packages/kocha/examples/hooks-pass.js')
  })
})
describe('hooks-fail example', function () {
  it('passes', () => {
    assert.throws(() => {
      execSync('./packages/kocha/bin/kocha.js ./packages/kocha/examples/hooks-fail.js')
    }, Error)
  })
})
describe('coffee-pass example', function () {
  it('passes', () => {
    execSync('./packages/kocha/bin/kocha.js --require coffee-script/register ./packages/kocha/examples/coffee-pass.coffee')
  })
})
