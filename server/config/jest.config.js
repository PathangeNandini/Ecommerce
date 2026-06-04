// jest.config.js
// Tells Jest to run a shared setup file before all test suites,
// and a teardown file after — used to start/stop in-memory Mongo.
module.exports = {
  testEnvironment: 'node',
  globalSetup: './tests/setup.js',
  globalTeardown: './tests/teardown.js',
  testTimeout: 15000,     // 15 s — enough for DB ops in slow CI runners
  forceExit: true,        // don't hang if a socket stays open
  verbose: true,
};