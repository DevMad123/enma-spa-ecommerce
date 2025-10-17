import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Charger les variables d’environnement (utile si tu veux lire APP_URL, etc.)
    const env = loadEnv(mode, process.cwd(), '');

    return {
        base: '/build/', // ✅ indispensable : Render sert ton app depuis /build
        plugins: [
            laravel({
                input: ['resources/js/app.jsx'], // ✅ ton point d’entrée React
                refresh: true,
            }),
            react(),
        ],
        build: {
            outDir: 'public/build', // ✅ destination finale du build
            manifest: true, // ✅ pour que Laravel le trouve
            emptyOutDir: true, // ✅ supprime l’ancien build avant de recréer
            rollupOptions: {
                input: ['resources/js/app.jsx'],
                external: [
                    '@testing-library/react',
                    '@testing-library/jest-dom'
                ],
            },
        },
        server: {
            host: '0.0.0.0', // ✅ indispensable sur Render
            port: Number(env.VITE_PORT) || 5173,
            strictPort: true,
            watch: {
                usePolling: true,
            },
        },
    };
});
