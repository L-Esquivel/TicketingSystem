import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false, // Run test files sequentially to prevent database cleanup race conditions
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
