const { execSync } = require('child_process')
const assert = require('power-assert')

describe('simple-pass example', () => {
  it('passes', () => {
    execSync('./bin/kocha.js ./examples/simple-pass.js')
  })
})
describe('simple-fail example', () => {
  it('fails', () => {
    assert.throws(() => {
      execSync('./bin/kocha.js ./examples/simple-fail.js')
    }, Error)
  })
})
describe('timeout-fail example', () => {
  it('fails', () => {
    assert.throws(() => {
      execSync('./bin/kocha.js ./examples/timeout-fail.js')
    }, Error)
  })
})
describe('nested-pass example', () => {
  it('passes', () => {
    execSync('./bin/kocha.js ./examples/nested-pass.js')
  })
})
describe('slow-pass example', () => {
  it('passes', () => {
    execSync('./bin/kocha.js ./examples/slow-pass.js')
  })
})
