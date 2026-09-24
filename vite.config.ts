import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: env.PAGES_BASE || '/',
    define: { __TEST_MODE__: JSON.stringify(env.TEST_MODE !== 'false') },
    server: { port: 32900, strictPort: true },
  };
});
