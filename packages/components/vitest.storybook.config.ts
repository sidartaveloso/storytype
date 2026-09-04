import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { type Plugin, searchForWorkspaceRoot, type UserConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

const dirname = import.meta.dirname;

/**
 * Storybook asks Vite to pre-bundle React, which its docs machinery uses
 * internally. In a Vue project React is not a project dependency, so Vite 8's
 * Rolldown dependency scanner reports it cannot resolve the entries and skips
 * them — four resolution failures in every run, for modules nothing here
 * imports.
 *
 * Known upstream: storybookjs/storybook#33091 and #33789. Until it is fixed
 * there, the entries are dropped from `optimizeDeps.include` after Storybook
 * has added them, which is why this runs `post`.
 */
function dropReactPrebundling(): Plugin {
  const isReact = (entry: string) => /^react(-dom)?(\/|$)/.test(entry);

  return {
    name: 'storytype:drop-react-prebundling',
    enforce: 'post',
    config(config) {
      const include = config.optimizeDeps?.include;
      if (!include) return;

      config.optimizeDeps = { ...config.optimizeDeps, include: include.filter(e => !isReact(e)) };
    },
  };
}

/**
 * Turns every story into a test, run in a real browser.
 *
 * A real browser is what makes the accessibility gate meaningful: axe needs
 * computed styles to judge colour contrast, and in jsdom it cannot.
 */
export default mergeConfig(
  viteConfig as UserConfig,
  defineConfig({
    plugins: [
      storybookTest({ configDir: path.join(dirname, '.storybook') }),
      dropReactPrebundling(),
    ],
    test: {
      name: 'storybook',
      browser: {
        enabled: true,
        headless: true,
        provider: playwright() as never,
        instances: [{ browser: 'chromium' }],
      },
    },
    server: {
      fs: {
        // The addon serves its own setup file from the store, which pnpm keeps
        // at the workspace root — outside this package, and so refused by
        // default
        allow: [searchForWorkspaceRoot(dirname)],
      },
    },
  }) as UserConfig
);
