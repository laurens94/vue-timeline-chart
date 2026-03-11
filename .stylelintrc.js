/** @type {import('stylelint').Config} */
export default {
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-standard-vue/scss",
    '@stylistic/stylelint-config',
  ],
  plugins: [
    "@stylistic/stylelint-plugin"
  ],
  rules: {
    "@stylistic/selector-combinator-space-before": "always",
    "@stylistic/max-line-length": null,
    'custom-property-pattern': [
      '^_?(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*)$',
      {
        message: 'Custom properties must use kebab-case and may start with an underscore for local variables.',
      },
    ],
    "@stylistic/indentation": [
      2,
      {
        baseIndentLevel: 1
      }
    ],
  },
  defaultSeverity: "warning",
  overrides: [
    {
      files: [
        "**/*.scss"
      ],
      customSyntax: "postcss-scss"
    },
    {
      files: [
        "**/*.vue"
      ],
      customSyntax: "postcss-html"
    }
  ]
}
