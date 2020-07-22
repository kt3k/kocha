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

module.exports = config => config.set(options)
