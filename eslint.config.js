import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/* 브라우저 전역과 이름이 겹쳐 import 누락을 놓치기 쉬운 식별자 */
const RESTRICTED_GLOBALS = ['when', 'name', 'status', 'open', 'find', 'event', 'print', 'close', 'length', 'top', 'parent', 'self'];

export default [
  { ignores: ['dist/', 'node_modules/', '*.html'] },
  js.configs.recommended,
  ...tseslint.configs.recommended.map(config => ({ ...config, files: ['src/**/*.{ts,tsx}', 'tests/unit/**/*.{ts,tsx}'] })),
  {
    files: ['src/**/*.{ts,tsx}', 'tests/unit/**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      eqeqeq: ['error', 'smart'],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
      'no-restricted-globals': ['error', ...RESTRICTED_GLOBALS],
    },
  },
  {
    files: ['tests/**/*.js', '*.config.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: globals.node },
  },
];
