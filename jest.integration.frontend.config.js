module.exports = {
  displayName: "integration-frontend",
  rootDir: ".",
  testEnvironment: "jsdom",
  testMatch: [
    "<rootDir>/__tests__/integration/frontend/**/*.test.js",
    "<rootDir>/client/__tests__/*.integration.test.js"
  ],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.integration.frontend.js"],
  moduleDirectories: ["client/node_modules", "node_modules"],
  transform: {
    "^.+\\.(js|jsx)$": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          ["@babel/preset-react", { runtime: "automatic" }],
        ],
      },
    ],
  },
  moduleNameMapper: {
    "^react$": "<rootDir>/client/node_modules/react",
    "^react-dom$": "<rootDir>/client/node_modules/react-dom",
    "^react-dom/client$": "<rootDir>/client/node_modules/react-dom/client",
    "^react-router-dom$": "<rootDir>/client/node_modules/react-router-dom",
    "^@testing-library/react$": "<rootDir>/node_modules/@testing-library/react",
    "^@testing-library/jest-dom$":
      "<rootDir>/node_modules/@testing-library/jest-dom",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  clearMocks: true,
};
