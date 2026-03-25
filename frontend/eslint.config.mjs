// @ts-check
import baseConfig from '../eslint.base.config.mjs';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  ...baseConfig,
  pluginReact.configs.flat.recommended,
  {
    plugins: { 'react-hooks': pluginReactHooks },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
  },
);
