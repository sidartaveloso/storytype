/**
 * @storytype/eslint-plugin
 * ESLint plugin for enforcing Storytype pattern rules
 */

const plugin = {
  meta: {
    name: '@storytype/eslint-plugin',
    version: '0.1.0',
  },
  rules: {
    // Rules will be added here
  },
  configs: {
    recommended: {
      plugins: ['@storytype'],
      rules: {
        // Recommended rules will be added here
      },
    },
  },
};

export default plugin;
