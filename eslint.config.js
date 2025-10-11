import eslint from '@eslint/js';
import react from 'eslint-plugin-react';
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
            react.configs.flat.recommended,
            react.configs.flat['jsx-runtime'],
            reactHooks.configs.flat.recommended,
        ],
        rules: {
            'react/prop-types': 'off',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    reactRefresh.configs.vite,
);
