import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.vue', 'src/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@storytype/components': resolve(import.meta.dirname, 'src/index.ts'),
      quasar: 'quasar/dist/quasar.client.js',
    },
  },
});
