import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tools/browser-tests',
  outputDir: process.env.ENROLLMENT_EVIDENCE_DIR || './test-results/enrollment',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: process.env.ENROLLMENT_EVIDENCE_DIR ? `${process.env.ENROLLMENT_EVIDENCE_DIR}/results.json` : 'test-results/results.json' }]],
  use: {
    baseURL: process.env.ENROLLMENT_PREVIEW_URL || 'http://127.0.0.1:32902',
    browserName: 'chromium',
    channel: 'msedge',
    viewport: { width: 1440, height: 1000 },
    trace: 'on', video: 'on', screenshot: 'only-on-failure',
  },
});
