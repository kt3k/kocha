# Tencha v0.1.0

> Simpler Mocha clone, no globals, lint friendly

# :cd: Install

    npm install tencha --save-dev

# Use in node.js

Require `describe`, `it` etc from tencha, and write tests as in `mocha`:

`test.js`:

```js
const { describe, it } = require('tencha')
const assert = require('assert')

describe('add', () => {
  it('adds the given numbers', () => {
    const sum = add(12, 13)

    assert(sum === 25)
  })
})
```

Then run it by `tencha` command.

    node_modules/.bin/tencha test.js

This outputs the report like mocha.

# Use in karma

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
} = require('tencha')
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

Tencha (碾茶) is a type of green tea made in Japan in which the tea leaves are steamed and dried immediately after harvest to prevent oxidization.

# License

MIT
