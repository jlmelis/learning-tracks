module.exports = {
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: 'module',
    },
    env: {
        es6: true,
        browser: true,
        node: true,
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
        indent: ['error', 2],
        semi: ['error', 'always'],
        quotes: ['error', 'single'],
        'no-trailing-spaces': ['error', { "skipBlankLines": true }],
        curly: ['error', 'all'],
        'brace-style': [2],
        'object-curly-spacing': ['error', 'always'],
        'block-spacing': ['error', 'always'],
        'no-multi-spaces': ['error'],
        'comma-dangle': ['error', 'always-multiline'],
        eqeqeq: ['error', 'always']
    },
    settings: {
        'svelte3/ignore-warnings': () => {
            return ['a11y-invalid-attribute'];
        },
    },
};
