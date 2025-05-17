/** @type {import('eslint').Linter.FlatConfigItem[]} */
module.exports = [
  {
    ignores: [
      '**/.next/**',
      'next.config.ts', // ignora explicitamente o arquivo next.config.ts na raiz
      'eslint.config.js',
      // Se desejar ignorar todos os arquivos de configuração na raiz:
      '*.config.{js,ts}',
      // Se desejar ignorar outros arquivos da raiz, adicione-os aqui
    ],
  },
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaVersion: 2021,
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
      },
    },
    plugins: {
      react: require('eslint-plugin-react'),
      'unused-imports': require('eslint-plugin-unused-imports'),
      'react-hooks': require('eslint-plugin-react-hooks'),
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];
