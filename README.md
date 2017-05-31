# Macha

> Mostly Mocha compatible simpler test runner.

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

## describe(title, callback)
## it(spec, callback)
## before(callback)
## beforeEach(callback)
## after(callback)
## afterEach(callback)
## describe.skip(title, callback)
## it.skip(spec, callback)

# License

MIT
