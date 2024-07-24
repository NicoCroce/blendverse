import globals from 'globals';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';
import { fixupConfigRules } from '@eslint/compat';
import reactHooks from 'eslint-plugin-react-hooks';
import BaseEslitConfig from '../../eslint.config.js';

const ignores = {
  ignores: ['tailwind.config.js'],
};

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  { languageOptions: { globals: globals.browser } },
  ...BaseEslitConfig,
  ...fixupConfigRules(pluginReactConfig),
  ignores,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'import/prefer-default-export': 'off',
      'react/function-component-definition': [
        2,
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/jsx-pascal-case': 2,
      'react/prop-types': 0,
      'arrow-body-style': 0,
      'import/no-unresolved': 0,
      'import/extensions': 0,
      'no-unused-expressions': ['error', { allowShortCircuit: true }],
      'react/react-in-jsx-scope': 0,
    },
  },
];
