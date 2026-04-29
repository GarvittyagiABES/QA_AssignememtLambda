const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  // Run TC1 and TC2 in parallel
  fullyParallel: true,
  workers: 1,

  timeout: 90000,

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  use: {
    browserName: 'chromium',
    headless: false,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 20000,
    navigationTimeout: 45000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
