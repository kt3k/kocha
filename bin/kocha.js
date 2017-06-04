#!/usr/bin/env node

const Cli = require('../src/cli')

require('minimisted')(argv => { new Cli().main(argv) })
