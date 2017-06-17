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

  it('throws when the input files are not found', () => {
    assert.throws(() => {
      execSync('./packages/kocha/bin/kocha.js abcde')
    }, Error)
  })

  it('does not throw when the input files are partially found', () => {
    execSync('./packages/kocha/bin/kocha.js abcde ./packages/kocha/examples/simple-pass.js')
  })

  it('does not throw when the input filename + .js exists', () => {
    execSync('./packages/kocha/bin/kocha.js ./packages/kocha/examples/simple-pass')
  })

  it('does not throw when the input arg is directory and it contains .js files', () => {
    execSync('./packages/kocha/bin/kocha.js ./packages/kocha/examples/example-dir')
  })
})
