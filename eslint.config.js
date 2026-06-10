import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      'docs/.vitepress/cache/**',
      'docs/.vitepress/dist/**',
      'node_modules/**',
      'packages/create-verse-bot/template/**', // шаблон не проверяем
    ],
  },

  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },

  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended],
  },

  {
    files: ['**/src/**/*.ts'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  {
    files: ['**/src/**/*.test.ts'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },

  eslintConfigPrettier,
);
