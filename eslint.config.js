import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default [
  // Ignore patterns
  {
    ignores: ['dist/**', 'node_modules/**', '*.d.ts', 'examples/**'],
  },

  // Vue recommended rules (includes vue-eslint-parser)
  ...pluginVue.configs['flat/recommended'],

  // TypeScript rules for .ts files only
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),

  // Vue files configuration - use vue-eslint-parser with TypeScript
  {
    files: ['**/*.vue'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      // TypeScript rules for Vue files
      // no-explicit-any disabled: acceptable uses documented in CLAUDE.md "Types as Contracts" section
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Project-specific config for src and test files
  {
    files: ['src/**/*.{vue,ts}', 'test/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Allow single-word component names (e.g., Message, Gallery)
      'vue/multi-word-component-names': 'off',

      // Relax formatting rules - these are style preferences, not errors
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/v-on-event-hyphenation': 'off',

      // v-html is used intentionally with sanitized content
      'vue/no-v-html': 'off',
      'vue/no-v-text-v-html-on-component': 'off',
      'vue/attributes-order': 'off',

      // TypeScript rules
      // no-explicit-any disabled: acceptable uses documented in CLAUDE.md "Types as Contracts" section
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]
