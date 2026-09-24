import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: { __TEST_MODE__: 'true' },
  test: { environment: 'jsdom', setupFiles: ['./src/test-setup.ts'] },
});
