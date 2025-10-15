#!/bin/sh
set -e

# Si .env n'existe pas, le copier depuis .env.example
if [ ! -f /var/www/html/.env ]; then
  cp /var/www/html/.env.example /var/www/html/.env
  echo ".env créé depuis .env.example"
fi

# Générer la clé, forcer l’override si nécessaire
php artisan key:generate --force

# Mettre en cache la config, les routes, les vues (si possible)
php artisan config:cache
php artisan route:cache || true
php artisan view:cache || true

# Fixer les permissions nécessaires
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

# Exécuter la commande par défaut du container (ex: php-fpm)
exec "$@"
