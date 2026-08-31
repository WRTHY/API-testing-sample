import { defineConfig } from '@playwright/test';
import 'dotenv/config';

/**
 * Playwright config for API-only testing (no browser needed).
 * We use Playwright's `request` fixture as an HTTP client — the same role
 * Postman, supertest, or RestAssured play. Nothing here launches a browser.
 *
 * reqres.in's classic "demo" endpoints (/api/users, /api/login, /api/register,
 * /api/unknown) don't require a key. If you sign up for a free reqres.in
 * account and grab a key, drop it in .env as REQRES_API_KEY and it'll be
 * sent automatically — useful if you start hitting rate limits, and a good
 * example of not hardcoding secrets into a test suite.
 */
const apiKey = process.env.REQRES_API_KEY;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: 'https://reqres.in/api',
    extraHTTPHeaders: {
      Accept: 'application/json',
      ...(apiKey ? { 'x-api-key': apiKey } : {}),
    },
  },
});
