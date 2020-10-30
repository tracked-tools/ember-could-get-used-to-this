module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['ember', '@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
  },
  rules: {
    'ember/no-jquery': 'error',
  },
  overrides: [
    // TypeScript
    {
      files: ['*.ts'],
      extends: [
        'eslint:recommended',
        'plugin:ember/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'prettier/@typescript-eslint',
      ],
    },

    // Tests
    {
      files: ['tests/**/*.{ts,js}'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },

    // Types
    {
      files: ['types/**/*.d.ts'],
      rules: {
        '@typescript-eslint/ban-types': 'off',
      },
    },

    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'index.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js',
      ],
      excludedFiles: [
        'addon/**',
        'addon-test-support/**',
        'app/**',
        'tests/dummy/app/**',
      ],
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      rules: Object.assign(
        {},
        require('eslint-plugin-node').configs.recommended.rules,
        {
          // add your custom rules and overrides for node files here
        }
      ),
    },
  ],
};
