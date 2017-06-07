const { execSync } = require('child_process')
const assert = require('power-assert')

describe('cli', () => {
  describe('-h, --help option', () => {
    it('shows the help message', () => {
      const output = execSync('./packages/kocha/bin/kocha.js -h')
      assert(/Usage: kocha \[options\] <files, \.\.\.>/.test(output))
    })
  })
  describe('-v, --version', () => {
    it('shows the version number', () => {
      const output = execSync('./packages/kocha/bin/kocha.js -v')
      assert(/kocha@\d+\.\d+\.\d/.test(output))
    })
  })

  it('throws when the input files are not given', () => {
    assert.throws(() => {
      execSync('./packages/kocha/bin/kocha.js')
    }, Error)
  })
})
