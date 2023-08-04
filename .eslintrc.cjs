module.exports = {
  parser: 'vue-eslint-parser',
  extends: ['eslint:recommended', 'plugin:vue/vue3-recommended', '@vue/eslint-config-typescript/recommended'],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaVersion: 2021,
    ecmaFeatures: {
      jsx: false,
    },
  },
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  rules: {
    // Regular ESLint rules:
    'max-len': 'off',

    // Vue ESLint rules:
    'vue/no-reserved-component-names': 'warn',
    'vue/attribute-hyphenation': ['warn', 'never', {}],
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
      'warn',
      {
        selfClosingTag: 'never',
      },
    ],
    'vue/singleline-html-element-content-newline': ['off', {}],
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 2,
        multiline: 1,
      },
    ],
    'vue/script-indent': [
      'warn',
      2,
      {
        baseIndent: 1,
        switchCase: 1,
        ignores: [],
      },
    ],
    'vue/order-in-components': [
      'warn',
      {
        order: [
          'el',
          'name',
          'key',
          'parent',
          'functional',
          ['delimiters', 'comments'],
          ['components', 'directives', 'filters'],
          'extends',
          'mixins',
          ['provide', 'inject'],
          'ROUTER_GUARDS',
          'layout',
          'middleware',
          'validate',
          'scrollToTop',
          'transition',
          'loading',
          'inheritAttrs',
          'model',
          ['props', 'propsData'],
          'emits',
          'setup',
          'asyncData',
          'data',
          'fetch',
          'head',
          'computed',
          'watch',
          'watchQuery',
          'LIFECYCLE_HOOKS',
          'methods',
          ['template', 'render'],
          'renderError',
        ],
      },
    ],
    'vue/v-on-event-hyphenation': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-components': 'warn',

    'no-inner-declarations': 'warn',
    'no-tabs': [
      'error',
      {
        allowIndentationTabs: false,
      },
    ],
    'indent': [
      'error',
      2,
      {
        VariableDeclarator: 'first',
        SwitchCase: 1,
      },
    ],
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'only-multiline', // do not require in multiline function calls, but do allow
      },
    ],
    'comma-spacing': [
      'error',
      {
        before: false,
        after: true,
      },
    ],
    'comma-style': ['error', 'last'],
    'brace-style': [
      'error',
      'stroustrup',
      {
        allowSingleLine: false,
      },
    ],
    'arrow-spacing': [
      'error',
      {
        before: true,
        after: true,
      },
    ],
    'no-debugger': 'off',
    'no-case-declarations': 'warn',
    'array-callback-return': 'warn',
    'eqeqeq': [
      'error',
      'always',
      {
        // Allow usage of != null
        null: 'ignore',
      },
    ],
    'quote-props': ['error', 'consistent-as-needed'],
    'quotes': [
      'error',
      'single',
      {
        allowTemplateLiterals: true,
      },
    ],
    'semi': [
      'error',
      'always',
      {
        omitLastInOneLineBlock: false,
      },
    ],
    'no-multi-spaces': [
      'warn',
      {
        ignoreEOLComments: true,
        exceptions: {
          BinaryExpression: false,
          ImportDeclaration: true,
          Property: true,
          VariableDeclarator: true,
        },
      },
    ],
    'block-spacing': ['error', 'always'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'computed-property-spacing': [
      'error',
      'never',
      {
        enforceForClassMembers: true,
      },
    ],
    'keyword-spacing': [
      'error',
      {
        before: true,
        after: true,
      },
    ],
    'space-before-blocks': 'error',
    'space-before-function-paren': 'warn',
    'space-in-parens': ['error', 'never'],
    'spaced-comment': [
      'warn',
      'always',
      {
        exceptions: ['*', '/'],
        markers: ['/'],
      },
    ],
    'switch-colon-spacing': [
      'error',
      {
        after: true,
        before: false,
      },
    ],
    'template-tag-spacing': ['error', 'never'],
    'wrap-regex': 'error',
    'semi-style': ['error', 'last'],
    'arrow-body-style': 'off',
    'curly': ['warn', 'all'],
    'no-var': 'error',
    'no-confusing-arrow': 'error',
    'prefer-const': 'error',
    'prefer-destructuring': 'warn',
    'prefer-template': 'error',
    'prefer-spread': 'error',
    'rest-spread-spacing': ['error', 'never'],
    'template-curly-spacing': ['error', 'never'],
    'no-fallthrough': [
      'error',
      {
        commentPattern: 'fallthrough',
      },
    ],
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        indent: 'off',
      },
    },
    {
      files: ['*.ts', '*.vue'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
