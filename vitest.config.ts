import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    conditions: ['node'],
  },
  optimizeDeps: {
    exclude: ['@prisma/client', '@prisma/adapter-pg', '.prisma/client'],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    server: {
      deps: {
        external: ['@prisma/client', '@prisma/adapter-pg', /\.prisma/, /@prisma/],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts'],
    },
  },
});
