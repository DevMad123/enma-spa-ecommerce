import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { Provider } from 'react-redux';
import store from './redux/store';
import { CartProvider } from './Layouts/FrontendLayout';
import { initLocale } from './Utils/LocaleUtils';

// ✅ Charger toutes les pages JS/TS/JSX/TSX de façon dynamique
const pages = import.meta.glob('./Pages/**/*.{js,jsx,ts,tsx}');

createInertiaApp({
    title: (title) => title,

    // ✅ Fonction de résolution robuste
    resolve: async (name) => {
        // Essaye toutes les extensions possibles
        const possiblePaths = [
            `./Pages/${name}.jsx`,
            `./Pages/${name}.js`,
            `./Pages/${name}.tsx`,
            `./Pages/${name}.ts`,
        ];

        const match = possiblePaths.find((path) => pages[path]);

        if (!match) {
            console.error(`[Inertia] Page introuvable : ${name}`);
            console.error('Chemins testés :', possiblePaths);
            throw new Error(`Inertia page not found: ${name}. Vérifie le chemin et la casse du fichier.`);
        }

        // Importe dynamiquement le composant
        const module = await pages[match]();

        if (!module?.default) {
            console.error(`[Inertia] Le module "${match}" n'exporte pas de composant par défaut.`);
            throw new Error(`Inertia page "${name}" existe mais n'exporte pas de composant par défaut.`);
        }

        return module;
    },

    setup({ el, App, props }) {
        const root = createRoot(el);

        // ✅ Initialisation du locale (sécurisée)
        try {
            const lc = props?.initialPage?.props?.localeConfig;
            if (lc && typeof lc === 'object') initLocale(lc);
        } catch (_) {}

        root.render(
            <Provider store={store}>
                <CartProvider>
                    <App {...props} />
                </CartProvider>
            </Provider>
        );
    },

    progress: { color: '#4B5563' },
});
