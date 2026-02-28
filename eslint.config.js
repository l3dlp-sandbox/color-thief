const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    js.configs.recommended,

    // ESM browser files
    {
        files: ['src/color-thief.js', 'src/core.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser
            }
        },
        rules: {
            'one-var': ['warn', { initialized: 'never' }]
        }
    },

    // CJS Node source files
    {
        files: ['src/color-thief-node.js', 'build/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.commonjs
            }
        },
        rules: {
            'one-var': ['warn', { initialized: 'never' }]
        }
    },

    // CJS Node test files (mocha globals)
    {
        files: ['test/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.commonjs,
                ...globals.mocha
            }
        },
        rules: {
            'one-var': ['warn', { initialized: 'never' }]
        }
    },

    // Cypress test files
    {
        files: ['cypress/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                cy: 'readonly',
                Cypress: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                before: 'readonly',
                beforeEach: 'readonly',
                after: 'readonly',
                afterEach: 'readonly',
                expect: 'readonly'
            }
        },
        rules: {
            'one-var': ['warn', { initialized: 'never' }]
        }
    }
];
