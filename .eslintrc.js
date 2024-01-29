module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'airbnb',
    'plugin:unicorn/recommended',
    'plugin:prettier/recommended',
  ],
  overrides: [
    {
      env: {
        browser: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
      },
    ],
    'spellcheck/spell-checker': [0],
    'no-param-reassign': [0, { state: false }],
    'no-tabs': ['error', { allowIndentationTabs: true }],
    'no-mixed-spaces-and-tabs': 0, // disallow mixed spaces and tabs for indentation
    'react/destructuring-assignment': [0, 'always'], // allow react state Object destructuring
    'max-len': ['error', { code: 200, tabWidth: 4, ignoreUrls: true }], // line Max length
    // 'no-shadow': 0, // disallow variable declarations from shadowing variables declared in the outer scope (no-shadow)
    'react/forbid-prop-types': [2, { forbid: ['any', 'array'] }], // Forbid certain propTypes
    'max-classes-per-file': ['error', 2],
    'react/jsx-props-no-spreading': [
      'off',
      {
        html: 'ignore',
        custom: 'ignore',
        exceptions: [''],
        'jsx-closing-bracket-location': [2, 'tag-aligned'],
      },
    ],
    'react/prop-types': 0,
    'prefer-destructuring': ['error', { object: true, array: false }],
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }], // Restrict file extensions that may contain JSX (react/jsx-filename-extension)
    'no-underscore-dangle': 0,
    'no-shadow': [
      'error',
      { builtinGlobals: false, hoist: 'functions', allow: [] },
    ],
    'object-curly-newline': 'off',
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
      },
    ],
    'unicorn/prevent-abbreviations': ['warn'],
  },
};
