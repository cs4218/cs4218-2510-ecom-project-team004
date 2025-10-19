const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './__tests__/UI',

  // Maximum time one test can run for
  timeout: 30_000,

  // Capture git information for better test reports
  captureGitInfo: { commit: true, diff: true },

  expect: {
    // Maximum time expect() should wait for condition to be met
    timeout: 5_000
  },

  // Fail the build on CI if test.only is left in source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests on CI
  retries: process.env.CI ? 2 : 0,

  // Run tests in parallel locally, sequentially on CI
  workers: process.env.CI ? 1 : undefined,

  // Multiple reporters for better visibility
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  // Shared settings for all projects
  use: {
    // Base URL for page.goto('/')
    baseURL: 'http://localhost:3000',

    // Action timeout for click(), fill(), etc.
    actionTimeout: 10_000,

    // Collect trace when retrying failed tests
    trace: 'on-first-retry',
    
    // Screenshot only on failure to save space
    screenshot: 'only-on-failure',
    
    // Video only on failure
    video: 'retain-on-failure',
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // Output directory for test artifacts
  outputDir: 'test-results/',

  // Start dev server before running tests
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});