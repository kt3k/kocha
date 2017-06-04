# Kocha v1.0.7

[![CircleCI](https://circleci.com/gh/kt3k/kocha.svg?style=svg)](https://circleci.com/gh/kt3k/kocha)
[![codecov](https://codecov.io/gh/kt3k/kocha/branch/master/graph/badge.svg)](https://codecov.io/gh/kt3k/kocha)

> Modern, simpler Mocha clone, no globals, lint friendly

Supports node.js >= active LTS.

# :cd: Install

    npm install kocha --save-dev

# Use in node.js

Require `describe`, `it` etc from kocha, and write tests as in `mocha`:

`test.js`:

```js
const { describe, it } = require('kocha')
const assert = require('assert')

const add = (a, b) => a + b

describe('add', () => {
  it('adds the given numbers', () => {
    const sum = add(12, 13)

    assert(sum === 25)
  })
})
```

Then run it by `kocha` command.

    ./node_modules/.bin/kocha test.js

This outputs the report like the below:

```
$ ./node_modules/.bin/kocha test.js

add
  ✓ adds the given numbers

  1 passing (4ms)
```

# Use in karma

TBD

# APIs

```js
const {
  describe,
  it,
  before,
  beforeEach,
  after,
  afterEach,
  timeout
} = require('kocha')
```

## describe(title, callback)

Adds the test suite by the `title` and `callback`. In `callback` function you can add child test suites and/or test cases.

## describe.skip(title, callback)

Adds the skipped test suite by the `title` and `callback`. The test suites and cases under this suite are all skipped as well.

## it(spec, callback)

Adds the skipped test case by the `title` and `callback`. `callback` implements your test case.

## it.skip(spec, callback)

Adds the skipped test case by the `title` and `callback`.

## before(callback)

Adds the before hook to the current suite.

## beforeEach(callback)

Adds the beforeEach hook to the current suite.

## after(callback)

Adds the after hook to the current suite.

## afterEach(callback)

Adds the afterEach hook to the current suite.

## timeout(timeout)

Sets the timeout duration to the current suite.

# Name

Kocha (紅茶, pronounced like ko-cha, not like ko-ka) means black tea in Japanese.

# License

MIT
