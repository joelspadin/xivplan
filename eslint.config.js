import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config({
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    ignores: ['dist'],

    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'],

    languageOptions: {
        ...react.configs.flat.recommended.languageOptions,
        ...react.configs.flat['jsx-runtime'].languageOptions,
        ecmaVersion: 2023,
        globals: globals.browser,
    },
    plugins: {
        react,
        'react-compiler': reactCompiler,
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
    },
    rules: {
        ...reactHooks.configs.recommended.rules,
        ...react.configs.flat.recommended.rules,
        ...react.configs.flat['jsx-runtime'].rules,
        'react/prop-types': 'off',
        'react-compiler/react-compiler': 'warn',
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
});
