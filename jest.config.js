module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/{controllers,decorators,middlewares,models,types}/**/*.js',
    '!**/node_modules/**',
    '!src/conf/**'
  ]
}
