export default {
  // display name
  displayName: "integration-backend",

  // when testing backend
  testEnvironment: "node",

  // only run these tests
  testMatch: ["<rootDir>/__tests__/integration/backend/**/*.test.js"],

  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.integration.backend.js"],
};
