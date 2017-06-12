const { it } = require('../')

it('fails', done => {
  setTimeout(() => {
    done()
    done()
  }, 100)
})
