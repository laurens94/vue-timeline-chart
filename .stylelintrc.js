/** @type {import('stylelint').Config} */
export default {
  extends: [
    '@stylistic/stylelint-config',
    'stylelint-config-recommended-vue',
  ],
  plugins: [
    "@stylistic/stylelint-plugin"
  ],
  rules: {
    'no-descending-specificity': null,
    "@stylistic/selector-combinator-space-before": "always",
    "@stylistic/max-line-length": null,
    'custom-property-pattern': [
      '^_?(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*)$',
      {
        message: 'Custom properties must use kebab-case and may start with an underscore for local variables.',
      },
    ],
  },
  defaultSeverity: "warning",
  overrides: [
    {
      files: [
        "**/*.vue"
      ],
      customSyntax: "postcss-html"
    }
  ]
}
