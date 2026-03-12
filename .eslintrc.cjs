module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  ignorePatterns: ['!**/.server', '!**/.client'],

  // Base config
  extends: ['eslint:recommended'],

  rules: {
    'prefer-const': 'warn',
    'no-case-declarations': 'warn',
    'no-unused-vars': 'warn',
  },

  overrides: [
    // React
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      plugins: ['react', 'jsx-a11y'],
      extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
      ],
      settings: {
        react: {
          version: 'detect',
        },
        formComponents: ['Form'],
        linkComponents: [
          { name: 'Link', linkAttribute: 'to' },
          { name: 'NavLink', linkAttribute: 'to' },
        ],
      },
      rules: {
        'prefer-const': 'warn',
        'no-case-declarations': 'warn',
        'jsx-a11y/click-events-have-key-events': 'warn',
        'jsx-a11y/no-static-element-interactions': 'warn',
        'jsx-a11y/label-has-associated-control': 'warn',
        'jsx-a11y/aria-role': 'warn',
        'jsx-a11y/img-redundant-alt': 'warn',
        'jsx-a11y/no-noninteractive-element-interactions': 'warn',
        'jsx-a11y/no-autofocus': 'warn',
        'jsx-a11y/no-noninteractive-tabindex': 'warn',
        'react/no-unescaped-entities': 'warn',
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'no-extra-semi': 'warn',
        'import/export': 'warn',
      },
    },

    // Typescript
    {
      files: ['**/*.{ts,tsx}'],
      plugins: ['@typescript-eslint', 'import'],
      parser: '@typescript-eslint/parser',
      settings: {
        'import/internal-regex': '^~/',
        'import/resolver': {
          node: {
            extensions: ['.ts', '.tsx'],
          },
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-var-requires': 'warn',
        'no-unused-vars': 'warn',
        'no-empty': 'warn',
        'prefer-const': 'warn',
        'no-case-declarations': 'warn',
        'import/no-unresolved': 'off',
        'import/export': 'warn',
      },
    },

    // Node
    {
      files: ['.eslintrc.cjs'],
      env: {
        node: true,
      },
    },
  ],
};
