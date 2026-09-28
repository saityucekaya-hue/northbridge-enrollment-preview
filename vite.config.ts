import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), {
      name: 'pages-route-entrypoints',
      apply: 'build',
      closeBundle() {
        // Pages serves directories, so direct links and refreshes need real entries.
        for (const route of ['dashboard', 'my-enrollment', 'my-enrollment-walkthrough']) {
          const directory = resolve('dist', route);
          mkdirSync(directory, { recursive: true });
          copyFileSync(resolve('dist/index.html'), resolve(directory, 'index.html'));
        }
      },
    }],
    base: env.PAGES_BASE || '/',
    define: { __TEST_MODE__: JSON.stringify(env.TEST_MODE !== 'false') },
    server: { port: 32900, strictPort: true },
  };
});
