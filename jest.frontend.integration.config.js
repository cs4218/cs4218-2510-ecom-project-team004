export default {
  // name displayed during tests
  displayName: "frontend",

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
  testEnvironment: "jest-environment-jsdom",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },

  // tells jest how to handle css/scss imports in your tests
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },

  // ignore all node_modules except styleMock (needed for css imports)
  transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

  // only run these tests
  testMatch: [
    "<rootDir>/client/__tests__/context-search.integration.test.js",
    "<rootDir>/client/__tests__/SearchInput.integration.test.js",
    "<rootDir>/client/__tests__/page-Search.integration.test.js",
    "<rootDir>/client/__tests__/ProductDetails.integration.test.js",
    "<rootDir>/client/__tests__/CategoryProduct.integration.test.js",
    "<rootDir>/client/__tests__/HomePage.integration.test.js",
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "client/src/components/**",
    "client/src/components/Routes/**",
    "client/src/components/Form/**",
    "client/src/pages/admin/**",
    "client/src/pages/Auth/**",
    "client/src/pages/**",
    "client/src/pages/user/**",
    "client/src/context/**",
    "client/src/hooks/**",
  ],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/client/src/setupTests.js"],
};
