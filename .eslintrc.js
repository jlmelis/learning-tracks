module.exports = {
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: 'module',
    },
    env: {
        es6: true,
        browser: true,
    },
    plugins: ['svelte3'],
    extends: ['eslint:recommended'],
    overrides: [
        {
            files: ['**/*.svelte'],
            processor: 'svelte3/svelte3',
        },
    ],
    rules: {
        // ...
    },
    settings: {
        'svelte3/ignore-warnings': () => {
            return ['a11y-invalid-attribute'];
        },
    },
};
