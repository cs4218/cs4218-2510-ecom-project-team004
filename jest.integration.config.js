export default {
  // display name
  displayName: "integration",

  // when testing backend
  testEnvironment: "node",

  // only run these tests
  testMatch: [
    "<rootDir>/__tests__/integration/*.test.js",
  ],
  
  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "config/**",
    "controllers/**",
    "helpers/**",
    "middlewares/**",
    "models/**",
    "!config/**/*.test.js",
    "!controllers/**/*.test.js",
    "!helpers/**/*.test.js",
    "!middlewares/**/*.test.js",
    "!models/**/*.test.js",
  ],

  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.integration.js'],
};