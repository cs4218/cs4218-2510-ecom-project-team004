export default {
  // display name
  displayName: "integration",

  // when testing backend
  testEnvironment: "node",

  // only run these tests
  testMatch: [
    "<rootDir>/__tests__/integration/*.test.js",
  ],
};