module.exports = {
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/essential',
    ],
    globals: {
        Vue: 'readonly',
    },
    rules: {
        'no-console': 'off',
    },
};
