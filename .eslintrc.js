module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    worker: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {},
};
