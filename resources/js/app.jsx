import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Provider } from 'react-redux';
import store from './redux/store';
import { CartProvider } from './Layouts/FrontendLayout';
import { initLocale } from './Utils/LocaleUtils';

createInertiaApp({
    title: (title) => {
        // Utiliser directement la variable d'environnement comme fallback
        // Le vrai nom sera géré par le Head component dans chaque page
        return title;
    },
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
        return pages[`./Pages/${name}.jsx`]
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Initialize locale config globally so formatters use admin settings
        try {
            const lc = props?.initialPage?.props?.localeConfig;
            if (lc && typeof lc === 'object') {
                initLocale(lc);
            }
        } catch (e) {
            // Silent fail – formatters have fallbacks
        }

        root.render(
            <Provider store={store}>
                <CartProvider>
                    <App {...props} />
                </CartProvider>
            </Provider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
