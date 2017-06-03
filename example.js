const assert = require('power-assert')
const Reporter = require('./src/reporters/spec')

const { describe, it, runner } = require('./src')

const reporter = new Reporter(runner, { files: [__filename] })

if (reporter) {}

const add = (a, b) => a + b

describe('add', () => {
  it('12 + 13 = 25', () => {
    const sum = add(12, 13)

    assert(sum === 25)
  })

  it('12 + 13 = 24', () => {
    const sum = add(12, 13)

    assert(sum === 24)
  })
})

setTimeout(() => { runner.run().catch(console.log) })
