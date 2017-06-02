# Macha

> Simpler Mocha clone, no globals, lint friendly

# :cd: Install

    npm install macha --save-dev

# Usage

Require `describe`, `it` etc from macha, and use it as in `mocha`:

```js
const { describe, it } = require('macha')
const assert = require('assert')

describe('add', () => {
  it('adds the given numbers', () => {
    const sum = add(12, 13)

    assert(sum === 25)
  })
})
```

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
} = require('macha')
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

# License

MIT
