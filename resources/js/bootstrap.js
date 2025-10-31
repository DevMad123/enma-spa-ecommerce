import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Forcer Ziggy à générer des URLs relatives par défaut pour éviter le Mixed Content en prod
try {
  if (typeof window.route === 'function') {
    const originalRoute = window.route;
    window.route = (name, params = undefined, absolute = false) => originalRoute(name, params, absolute);
  }
} catch (_) {}
