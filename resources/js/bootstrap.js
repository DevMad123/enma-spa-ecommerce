import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// Sanctum stateful cookies: activer l'envoi des cookies + XSRF
window.axios.defaults.withCredentials = true;
window.axios.defaults.xsrfCookieName = 'XSRF-TOKEN';

// Initialiser le cookie XSRF de Sanctum (utile si front et API sont sur des domaines diff�rents)
try {
  window.axios.get('/sanctum/csrf-cookie').catch(() => {});
} catch (_) {}

// Forcer Ziggy à générer des URLs relatives par défaut pour éviter le Mixed Content en prod
try {
  if (typeof window.route === 'function') {
    const originalRoute = window.route;
    window.route = (name, params = undefined, absolute = false) => originalRoute(name, params, absolute);
  }
} catch (_) {}

