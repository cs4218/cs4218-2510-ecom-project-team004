export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  testMatch: [
    "<rootDir>/__tests__/integration/productModel.integration.test.js",
    "<rootDir>/__tests__/integration/productController.integration.test.js",
    "<rootDir>/__tests__/integration/productRoutes.integration.test.js",
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "config/**",
    "controllers/**",
    "helpers/**",
    "middlewares/**",
    "models/**"
  ],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
};
