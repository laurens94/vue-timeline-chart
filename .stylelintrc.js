/** @type {import('stylelint').Config} */
export default {
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-standard-vue/scss"
  ],
  plugins: [
    "@stylistic/stylelint-plugin"
  ],
  rules: {
    "@stylistic/selector-combinator-space-before": "always",
    "@stylistic/max-line-length": null,
    "custom-property-pattern": null,
    "@stylistic/indentation": [
      2,
      {
        baseIndentLevel: 1
      }
    ],
    "color-function-notation": null,
    "no-empty-source": null,
    "value-no-vendor-prefix": [
      true,
      {
        ignoreValues: ["inline-box"]
      }
    ]
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
