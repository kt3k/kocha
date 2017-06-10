const options = {
  frameworks: ['kocha', 'browserify'],
  files: [
    'packages/karma-kocha/__tests__/*.js'
  ],
  preprocessors: {
    'packages/karma-kocha/__tests__/*.js': ['browserify']
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
  options.sauceLabs = { testName: 'kocha-ci' }
}

module.exports = config => config.set(options)
