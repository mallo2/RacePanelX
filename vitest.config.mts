import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: [
        'src/config/**/*.ts',
        'src/i18n/messages.ts',
        'src/types/**/*.ts',
        'src/protocol/**/*.ts',
        'src/services/**/*.ts',
        'src/store/store.ts',
        'src/utils/**/*.ts',
      ],
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'coverage/unit',
      thresholds: {
        branches: 90,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
  },
});
