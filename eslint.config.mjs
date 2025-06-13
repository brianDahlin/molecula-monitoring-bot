import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import parser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  eslint.configs.recommended,

  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      parser,
      parserOptions: {
        project: [path.join(__dirname, 'tsconfig.json')],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    extends: [
      // рекомендуемые правила TS-ESLint, включая требующие type-checking
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    rules: {
      // ваши overrides
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      // пусть тут болтается, вдруг будет нужно:
      // '@typescript-eslint/no-unsafe-call': 'off',
      // '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
];
