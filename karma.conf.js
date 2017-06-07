module.exports = config => config.set({
  frameworks: ['kocha', 'browserify'],
  files: [
    'packages/karma-kocha/__tests__/*.js'
  ],
  preprocessors: {
    'packages/karma-kocha/__tests__/*.js': ['browserify']
  },
  browserify: {
    debug: true
  },
  browsers: ['Chrome'],
  singleRun: true,
  plugins: [
    require.resolve('./packages/karma-kocha'),
    'karma-browserify',
    'karma-chrome-launcher'
  ]
})
