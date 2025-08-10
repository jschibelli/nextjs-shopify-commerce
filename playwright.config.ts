import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Set demo mode environment variables for tests
        extraHTTPHeaders: {
          'X-Test-Mode': 'true',
        },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      // Set demo environment variables for the dev server during tests
      DEMO_MODE: 'true',
      DEMO_PASSWORD: process.env.DEMO_PASSWORD || 'demo123',
      DEMO_ADMIN_EMAIL: 'demo+admin@example.com',
      DEMO_CUSTOMER_EMAIL: 'demo+customer@example.com',
      DEMO_CUSTOMER_ID: 'demo_customer',
      // Pass through E2E credentials
      E2E_EMAIL: process.env.E2E_EMAIL,
      E2E_PASSWORD: process.env.E2E_PASSWORD,
    },
  },
}); 