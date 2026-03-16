import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            injectManifest: {
                globPatterns: ['**/*.{js,css,html,svg,png,ico}']
            },
            manifest: {
                name: 'A Better Habit Tracker',
                short_name: 'Habit Tracker',
                description: 'Single-screen offline-first habit and work tracker with Google Sheets sync.',
                theme_color: '#f5f1e8',
                background_color: '#f5f1e8',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                icons: [
                    {
                        src: '/icon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    }
                ]
            },
            devOptions: {
                enabled: true
            }
        })
    ]
});
