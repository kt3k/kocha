var path = require('path')

var createPattern = function (path) {
  return { pattern: path, included: true, served: true, watched: false }
}
var initKocha = function (files) {
  files.unshift(createPattern(path.join(__dirname, 'adaptor.js')))
}

initKocha.$inject = ['config.files']

module.exports = { 'framework:kocha': ['factory', initKocha] }
