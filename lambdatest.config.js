const { defineConfig } = require('@playwright/test');

const LT_USERNAME   = process.env.LT_USERNAME;
const LT_ACCESS_KEY = process.env.LT_ACCESS_KEY;

if (!LT_USERNAME || !LT_ACCESS_KEY) {
  console.error('\nERROR: LT_USERNAME and LT_ACCESS_KEY environment variables must be set.\n');
  process.exit(1);
}

const capabilities = {
  browserName: 'Chrome',
  browserVersion: 'latest',
  'LT:Options': {
    platform: 'Windows 10',
    build: 'Amazon Shopping Tests',
    name: 'TC1 + TC2 Parallel Run',
    user: LT_USERNAME,
    accessKey: LT_ACCESS_KEY,
    network: true,
    video: true,
    visual: true,
    console: true,
    tunnel: false,
  },
};

const wsEndpoint = `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  timeout: 120000,

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  use: {
    connectOptions: { wsEndpoint },
    viewport: { width: 1280, height: 800 },
    actionTimeout: 30000,
    navigationTimeout: 60000,
    screenshot: 'only-on-failure',
  },
});
