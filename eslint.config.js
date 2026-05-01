import eslint from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
    {
        files: ['**/*.{ts,tsx}'],
        ignores: ['dist'],

        languageOptions: {
            ecmaVersion: 2023,
            globals: globals.browser,
        },
        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            eslintReact.configs['recommended-typescript'],
        ],
        rules: {
            '@eslint-react/no-array-index-key': 'off',
            '@eslint-react/use-state': [
                'warn',
                {
                    enforceAssignment: false,
                },
            ],

            // Duplicates eslint-plugin-react-hooks
            '@eslint-react/exhaustive-deps': 'off',
            '@eslint-react/set-state-in-effect': 'off',
            '@eslint-react/static-components': 'off',
        },
    },
    reactRefresh.configs.vite,
);
