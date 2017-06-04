# Kocha v1.0.1

[![CircleCI](https://circleci.com/gh/kt3k/kocha.svg?style=svg)](https://circleci.com/gh/kt3k/kocha)
[![codecov](https://codecov.io/gh/kt3k/kocha/branch/master/graph/badge.svg)](https://codecov.io/gh/kt3k/kocha)

> Modern, simpler Mocha clone, no globals, lint friendly

# :cd: Install

    npm install kocha --save-dev

# Use in node.js

Require `describe`, `it` etc from kocha, and write tests as in `mocha`:

`test.js`:

```js
const { describe, it } = require('kocha')
const assert = require('assert')

describe('add', () => {
  it('adds the given numbers', () => {
    const sum = add(12, 13)

    assert(sum === 25)
  })
})
```

Then run it by `kocha` command.

    node_modules/.bin/kocha test.js

This outputs the report like mocha.

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
## describe.skip(title, callback)
## it(spec, callback)
## it.skip(spec, callback)
## before(callback)
## beforeEach(callback)
## after(callback)
## afterEach(callback)
## timeout(timeout)

# Name

Kocha (紅茶, pronounced like ko-cha, not ko-ka) means black tea in Japanese.

# License

MIT
