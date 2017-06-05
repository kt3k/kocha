# Kocha v1.0.9

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
  timeout,
  retries
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

Sets the timeout duration to the test cases or the test suites.

## retries(n)

Sets the retry count of the test cases or the test suites.

# Goals

- Support BDD mode, Spec reporter of [mocha][mocha] in CommonJS environment.
  - This includes Karma environment with CommonJS bundler (browserify, webpack).

## Non-goals

- Kocha isn't a drop-in replacement of [mocha][mocha].
- Kocha doesn't support interfaces other than `BDD`, like `TDD`, `QUnit`, `Exports` etc
- Kocha doesn't support standalone mode in browser.
- Kocha's BDD interface is not identical to Mocha's BDD interface. See the below for details.

# Differences from mocha

- Kocha doesn't have `this.timeout(ms)` API. Use `kocha.timeout(ms)` API instead.
- Kocha doesn't have `this.retries(n)` API. Use `kocha.retries(n)` API instead.
- Kocha doesn't have `xdescribe` and `xit`. Instead use `describe.skip` and `it.skip` resp.
- Kocha doesn't have `context` and `specify` keyword. Use `describe` and `it` resp.

# Migration from mocha

## For node.js

1. Use `kocha` command instead of `mocha` or `_mocha` command.
1. Add `const { describe, it, ... } = require('kocha')` statement on the top of each mocha test script.
1. Rewrite `xdescribe` and `xit` to `describe.skip` and `it.skip` resp. if you have any.
1. Rewrite `this.timeout(N)` to `kocha.timeout(N)` if you have any.
1. Rewrite `this.retries(N)` to `kocha.retries(N)` if you have any.
1. Rewrite `context` and `specify` to `describe` to `it` resp. if you have any.
1. Then your tests should work with kocha.

If the above doesn't work, please file an issue.

## For karma

TBD

# Name

Kocha (紅茶, pronounced like ko-cha, not like ko-ka) means black tea in Japanese.

# License

MIT

[mocha]: https://github.com/mochajs/mocha
