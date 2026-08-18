import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: [{ find: '@server', replacement: resolve(__dirname, 'src') }],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/domains/**/*.ts'],
      exclude: [
        'src/domains/**/index.ts',
        'src/domains/**/*.model.ts',
        'src/domains/**/*.routes.ts',
        'src/domains/**/*.di.ts',
      ],
    },
  },
});
