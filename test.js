const assert = require('assert')
const Reporter = require('mocha-better-spec-reporter')

const { describe, it, macha } = require('./')

const reporter = new Reporter(macha, { files: [__filename] })

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

setTimeout(() => { macha.run().catch(console.log) })
