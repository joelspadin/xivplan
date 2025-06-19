import react from '@vitejs/plugin-react';
import { UserConfig, defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
const isProduction = process.env.NODE_ENV === 'production';

let devOptions: Partial<UserConfig> | undefined;
if (!isProduction) {
    devOptions = {
        esbuild: {
            minifyIdentifiers: false,
        },
        resolve: {
            alias: {
                'react-dom$': 'react-dom/profiling',
            },
        },
    };
}

export default defineConfig({
    ...devOptions,
    plugins: [
        react(),
        svgr({
            svgrOptions: {
                plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
                svgoConfig: {
                    floatPrecision: 2,
                    plugins: [
                        {
                            name: 'preset-default',
                            params: {
                                overrides: {
                                    removeViewBox: false,
                                },
                            },
                        },
                        'prefixIds',
                    ],
                },
            },
        }),
        VitePWA({
            strategies: 'generateSW',
            registerType: 'prompt',
            injectRegister: false,
            pwaAssets: { disabled: false, config: true, htmlPreset: '2023', overrideManifestIcons: true },
            manifest: {
                name: 'XIVPlan',
                short_name: 'XIVPlan',
                description: 'FFXIV raid planner',
                display: 'standalone',
                theme_color: '#1e1e1e',
                icons: [
                    {
                        src: 'pwa-64x64.png',
                        sizes: '64x64',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'maskable-icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
                file_handlers: [
                    {
                        action: '/open',
                        accept: {
                            'application/vnd.xivplan.plan+json': ['.xivplan'],
                        },
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,svg,ico}'],
                cleanupOutdatedCaches: true,
                clientsClaim: true,
                maximumFileSizeToCacheInBytes: 4 * 1000 * 1000,
            },
            injectManifest: {
                globPatterns: ['**/*.{js,css,html,svg,png,svg,ico}'],
            },
            devOptions: {
                enabled: true,
                type: 'module',
            },
        }),
    ],
});
