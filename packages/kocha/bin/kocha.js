#!/usr/bin/env node

const Cli = require('../src/cli')

require('minimisted')(argv => { new Cli().main(argv) }, {
  string: ['timeout', 'require', 'config'],
  boolean: ['version', 'v', 'help', 'h'],
  alias: {
    v: 'version',
    h: 'help',
    t: 'timeout',
    c: 'config',
    r: 'require'
  }
})
