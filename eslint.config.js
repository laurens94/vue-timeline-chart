import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import stylistic from '@stylistic/eslint-plugin';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default defineConfigWithVueTs([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/coverage/**', '**/docs/.vitepress/cache/**', '**/docs/.vitepress/dist/**'],
  },

  {
    languageOptions: {
      globals: {
        ...globals.es2021,
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  stylistic.configs.customize({ semi: true }),

  {
    rules: {
      'vue/attribute-hyphenation': ['error', 'never'],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'never',
            component: 'always',
          },
          svg: 'any',
        },
      ],
      'vue/html-closing-bracket-spacing': [
        'error',
        {
          selfClosingTag: 'never',
        },
      ],
      'vue/singleline-html-element-content-newline': ['off'],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 2,
          multiline: 1,
        },
      ],
      'vue/script-indent': [
        'error',
        2,
        {
          baseIndent: 1,
          switchCase: 1,
        },
      ],
      'vue/v-on-event-hyphenation': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'array-callback-return': 'error',
      'eqeqeq': [
        'error',
        'always',
        {
          // Allow usage of != null
          null: 'ignore',
        },
      ],
      'curly': ['warn', 'all'],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
    },
  },

  {
    files: ['**/*.vue'],
    rules: {
      '@stylistic/indent': 'off',
    },
  },
]);
