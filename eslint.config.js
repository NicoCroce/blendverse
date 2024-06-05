import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const ignores = {
  ignores: [
    'coverage/**',
    'public/**',
    'dist/**',
    'pnpm-lock.yaml/**',
    'pnpm-workspace.yaml/**',
  ],
};

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser, ...globals.es2021 },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ignores,
  eslintPluginPrettierRecommended,
];
