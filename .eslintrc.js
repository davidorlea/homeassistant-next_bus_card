module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'airbnb-base',
    'plugin:lit/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    indent: ['error', 2, { ignoredNodes: ['TemplateLiteral > *'] }],
    'no-param-reassign': ['error', { props: false }],
    'no-underscore-dangle': 0,
  },
};
