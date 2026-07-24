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
      'vue/block-lang': ['error', { script: { lang: ['ts', 'js'] } }],
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
      '@stylistic/multiline-ternary': 'off',
      '@stylistic/space-before-function-paren': ['error', 'always'],
      '@stylistic/comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
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
