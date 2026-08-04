import { getStoryContext } from '@storybook/test-runner';
import type { TestRunnerConfig } from '@storybook/test-runner';
import { getAxeResults } from 'axe-playwright';

/**
 * Executes axe accessibility checks on every story before CI accepts the
 * component. Fails the run when a serious or critical violation is found.
 *
 * This runs on `pnpm storybook:test` via @storybook/test-runner, satisfying
 * the "teste de acessibilidade antes do commit" quality gate.
 */
const config: TestRunnerConfig = {
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    if (storyContext.parameters?.a11y?.test === 'todo') {
      return;
    }
    // The Quasar dialog backdrop (decorative, aria-hidden) is a fixed overlay.
    // axe-core's colour-contrast mistakenly blends it as the button background
    // and reports false positives. Hide it so contrast is measured against the
    // real card/banner surface behind the buttons.
    await page.addStyleTag({
      content: '.q-dialog__backdrop { display: none !important; }',
    });
    const results = await getAxeResults(page);
    const serious = (results.violations ?? []).filter(
      v => v.impact === 'serious' || v.impact === 'critical'
    );
    if (serious.length) {
      throw new Error(
        'A11y ' +
          serious.map(v => v.id).join(',') +
          ': ' +
          JSON.stringify(
            serious.map(v => ({
              id: v.id,
              nodes: v.nodes.map(n => ({ target: n.target, html: n.html })),
            }))
          )
      );
    }
  },
};

export default config;
