import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { searchForWorkspaceRoot, type UserConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

const dirname = import.meta.dirname;

/**
 * Turns every story into a test, run in a real browser.
 *
 * A real browser is what makes the accessibility gate meaningful: axe needs
 * computed styles to judge colour contrast, and in jsdom it cannot.
 */
export default mergeConfig(
  viteConfig as UserConfig,
  defineConfig({
    plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
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
