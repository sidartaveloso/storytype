import type { Preview } from '@storybook/vue3';
import { setup } from '@storybook/vue3';
import { Quasar } from 'quasar';
import * as QuasarExports from 'quasar';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

/**
 * Registers every Quasar UI component and directive explicitly.
 *
 * `app.use(Quasar, { config })` alone does NOT register any component — the
 * Quasar `install` hook only registers what is passed in `components` /
 * `directives`. The unit tests register manually per spec; here we register
 * everything so every story renders its `q-*` tags for real (the a11y gate
 * depends on it).
 */
const isComponent = (v: unknown): v is { name: string } =>
  typeof v === 'object' &&
  v !== null &&
  (v as { name?: unknown }).name !== undefined &&
  /^Q[A-Z]/.test((v as { name: string }).name);

const isDirective = (v: unknown): v is { name: string } =>
  typeof v === 'object' &&
  v !== null &&
  (v as { name?: unknown }).name !== undefined &&
  /^[a-z]/.test((v as { name: string }).name) &&
  (v as { name: string }).name === (v as { name: string }).name.toLowerCase();

const components = Object.values(QuasarExports)
  .filter(isComponent)
  .reduce<Record<string, object>>((acc, c) => {
    acc[c.name] = c;
    return acc;
  }, {});

const directives = Object.values(QuasarExports)
  .filter(isDirective)
  .reduce<Record<string, object>>((acc, d) => {
    acc[d.name] = d;
    return acc;
  }, {});

setup(app => {
  app.use(Quasar, {
    config: {
      brand: {
        primary: '#2c3f91',
        secondary: '#26a69a',
        accent: '#9c27b0',
      },
    },
    components,
    directives,
  });
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
    },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
      },
    },
  },
};

export default preview;
