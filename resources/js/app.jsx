import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { Provider } from 'react-redux';
import store from './redux/store';
import { CartProvider } from './Layouts/FrontendLayout';
import { initLocale } from './Utils/LocaleUtils';

// Charger toutes les pages (JS/TS/JSX/TSX)
const pages = import.meta.glob('./Pages/**/*.{js,jsx,ts,tsx}');

// Index insensible à la casse (clé normalisée → clé réelle)
const pagesIndexCI = Object.fromEntries(
  Object.keys(pages).map((key) => [key.toLowerCase(), key])
);

createInertiaApp({
  title: (title) => title,

  // Résolution robuste: exact → fallback insensible à la casse
  resolve: async (name) => {
    const candidates = [
      `./Pages/${name}.jsx`,
      `./Pages/${name}.js`,
      `./Pages/${name}.tsx`,
      `./Pages/${name}.ts`,
    ];

    const load = (key) => pages[key]().then((m) => m.default || m);

    // a) Correspondance exacte
    for (const path of candidates) {
      if (pages[path]) return load(path);
    }

    // b) Fallback insensible à la casse (Linux)
    for (const path of candidates) {
      const ciKey = pagesIndexCI[path.toLowerCase()];
      if (ciKey && pages[ciKey]) {
        if (import.meta?.env?.DEV) {
          console.warn(`[Inertia] Résolution sans respecter la casse: "${name}" → ${ciKey}`);
        }
        return load(ciKey);
      }
    }

    console.error(`[Inertia] Page introuvable: ${name}`);
    console.error('Chemins testés:', candidates);
    throw new Error(`Inertia page not found: ${name}. Vérifie le chemin et la casse du fichier.`);
  },

  setup({ el, App, props }) {
    const root = createRoot(el);

    // Initialisation de la locale (sécurisée)
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

