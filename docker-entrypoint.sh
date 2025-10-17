#!/bin/sh
set -e

# Si .env n'existe pas, le copier depuis .env.example
if [ ! -f /var/www/html/.env ]; then
  cp /var/www/html/.env.example /var/www/html/.env
  echo ".env créé depuis .env.example"
fi

# Générer la clé d'application (si non présente)
php artisan key:generate --force

# Appliquer les migrations automatiquement (important pour Render)
php artisan migrate --force || true

# Mettre en cache la configuration, routes et vues
php artisan config:cache
php artisan route:cache || true
php artisan view:cache || true

# Fixer les permissions nécessaires
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

# Démarrer le serveur Laravel
RENDER_PORT=${PORT:-8000}
echo "🚀 Démarrage du serveur Laravel sur 0.0.0.0:${RENDER_PORT}"

exec php artisan serve --host=0.0.0.0 --port="${RENDER_PORT}"
