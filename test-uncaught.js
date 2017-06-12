it('Uncaught error', done => {
  setTimeout(() => {
    throw new Error('foo')
  }, 0)
})
