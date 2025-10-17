import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Charger les variables d’environnement (.env)
    const env = loadEnv(mode, process.cwd(), '');

    return {
        base: '/build/', // ✅ IMPORTANT pour Render
        plugins: [
            laravel({
                input: ['resources/js/app.jsx'],
                refresh: true,
            }),
            react(),
        ],
        build: {
            outDir: 'public/build',
            manifest: true,
            rollupOptions: {
                external: [
                    '@testing-library/react',
                    '@testing-library/jest-dom'
                ]
            }
        }
    };
});
