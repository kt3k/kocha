const options = {
  frameworks: ['kocha', 'browserify'],
  files: [
    'packages/karma-kocha/examples/*.js'
  ],
  preprocessors: {
    'packages/karma-kocha/examples/*.js': ['browserify']
  },
  browserify: { debug: true },
  reporters: ['progress'],
  browsers: ['Chrome'],
  singleRun: true,
  plugins: [
    require.resolve('./packages/karma-kocha'),
    'karma-browserify',
    'karma-chrome-launcher'
  ]
}

if (process.env.CI) {
  // Sauce Labs settings
  const customLaunchers = require('./karma.custom-launchers.js')
  options.plugins.push('karma-sauce-launcher')
  options.customLaunchers = customLaunchers
  options.browsers = Object.keys(options.customLaunchers)
  options.reporters.push('saucelabs')
  options.sauceLabs = {
    testName: 'kocha-ci'
    startConnect: false,
    tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
  }
}

module.exports = config => config.set(options)
