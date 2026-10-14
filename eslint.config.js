import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/', '*.html'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: globals.browser },
    rules: {
      'no-shadow': 'error',
      'no-unused-expressions': 'error',
      eqeqeq: ['error', 'smart'],
      'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      /* 브라우저 전역과 이름이 겹쳐 import 누락을 놓치기 쉬운 식별자 */
      'no-restricted-globals': ['error', 'when', 'name', 'status', 'open', 'find', 'event', 'print', 'close', 'length', 'top', 'parent', 'self'],
    },
  },
  {
    files: ['tests/**/*.js', '*.config.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: globals.node },
  },
];
