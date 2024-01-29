module.exports = {
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.svg', 'node_modules/**'],
  // Include the standard ruleset, scss rules, & smacss property ordering
  extends: [
    'stylelint-config-standard',
    'stylelint-config-property-sort-order-smacss',
    'stylelint-prettier/recommended',
  ],
  plugins: ['stylelint-scss'],
  rules: {
    // Use scss at-rule-no-unknown instead of default stylelint
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
    'declaration-no-important': true,

    // Allow usage of :global
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'export'],
      },
    ],

    // Allow amp selector types
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: [/^amp-/],
      },
    ],

    // Cannot nest more than 5 levels deep
    'max-nesting-depth': 5,

    // Disallow selectors with no qualifying type for ids
    'selector-no-qualifying-type': [
      true,
      {
        ignore: ['attribute', 'class'],
      },
    ],

    // Enforce no use of hex or named colors in non-variable files
    // e.g. enforce variable usage for colors
    'color-no-hex': true,
    'color-named': 'never',

    // Don't allow extension in SCSS imports
    'scss/at-import-partial-extension': 'never',

    // Don't allow SCSS after closing bracket, unless if else
    'block-closing-brace-newline-after': [
      'always',
      {
        ignoreAtRules: ['if', 'else'],
      },
    ],
  },
};
