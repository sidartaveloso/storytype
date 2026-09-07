import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const dirname = import.meta.dirname;
const src = resolve(dirname, 'src');

/**
 * One entry per barrel, named after its path under `src/` (without the
 * extension). `vue-tsc` emits the declarations with the same layout — `rootDir`
 * is `src` — so `dist/components/atoms/avatar/index.js` sits next to its
 * `index.d.ts`, and the `exports` map in package.json can point at both.
 */
function barrelEntries(): Record<string, string> {
  const entries: Record<string, string> = { index: resolve(src, 'index.ts') };
  const levels = readdirSync(resolve(src, 'components'), { withFileTypes: true }).filter(d =>
    d.isDirectory()
  );
  for (const level of levels) {
    const components = readdirSync(resolve(src, 'components', level.name), {
      withFileTypes: true,
    }).filter(d => d.isDirectory());
    for (const component of components) {
      entries[`components/${level.name}/${component.name}/index`] = resolve(
        src,
        'components',
        level.name,
        component.name,
        'index.ts'
      );
    }
  }
  for (const util of readdirSync(resolve(src, 'utils'), { withFileTypes: true }).filter(d =>
    d.isDirectory()
  )) {
    entries[`utils/${util.name}/index`] = resolve(src, 'utils', util.name, 'index.ts');
  }
  return entries;
}

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: barrelEntries(),
      formats: ['es'],
      // `./styles` in package.json — every component's CSS, extracted once.
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: ['vue', 'quasar'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        globals: {
          vue: 'Vue',
          quasar: 'Quasar',
        },
      },
    },
    sourcemap: true,
  },
});
