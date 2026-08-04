import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const dirname = import.meta.dirname;

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(dirname, 'src/index.ts'),
      name: 'StorytypeComponents',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'quasar'],
      output: {
        globals: {
          vue: 'Vue',
          quasar: 'Quasar',
        },
      },
    },
    sourcemap: true,
  },
});
