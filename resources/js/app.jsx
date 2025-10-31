import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { Provider } from 'react-redux';
import store from './redux/store';
import { CartProvider } from './Layouts/FrontendLayout';
import { initLocale } from './Utils/LocaleUtils';

// 1) Charger toutes les pages (code splitting activé)
const pages = import.meta.glob('./Pages/**/*.{js,jsx,ts,tsx}');

// 2) Index insensible à la casse pour les chemins renvoyés par le serveur
const pagesIndexCI = Object.fromEntries(
  Object.keys(pages).map((key) => [key.toLowerCase(), key])
);

createInertiaApp({
  title: (title) => title,

  // 3) Résolution robuste: exact → fallback insensible à la casse
  resolve: async (name) => {
    const candidates = [
      `./Pages/${name}.jsx`,
      `./Pages/${name}.js`,
      `./Pages/${name}.tsx`,
      `./Pages/${name}.ts`,
    ];

    // a) Correspondance exacte
    for (const path of candidates) {
      if (pages[path]) return pages[path]();
    }

    // b) Fallback insensible à la casse (Linux-safe)
    for (const path of candidates) {
      const ciKey = pagesIndexCI[path.toLowerCase()];
      if (ciKey && pages[ciKey]) return pages[ciKey]();
    }

    console.error(`[Inertia] Page introuvable: ${name}`);
    console.error('Chemins testés:', candidates);
    throw new Error(`Inertia page not found: ${name}. Vérifie le chemin et la casse du fichier.`);
  },

  setup({ el, App, props }) {
    const root = createRoot(el);

    // 4) Initialisation de la locale (sécurisée)
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

