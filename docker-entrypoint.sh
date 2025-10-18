#!/bin/sh
set -e

echo "🔍 Vérification du fichier .env..."

# --- 1️⃣ Créer .env si absent ---
if [ ! -f /var/www/html/.env ]; then
  cp /var/www/html/.env.example /var/www/html/.env
  echo "✅ .env créé depuis .env.example"
fi

# --- 2️⃣ Générer la clé Laravel ---
if ! grep -q "APP_KEY=" /var/www/html/.env || [ -z "$(grep 'APP_KEY=' /var/www/html/.env | cut -d '=' -f2)" ]; then
  echo "🔑 Génération de la clé d’application..."
  php artisan key:generate --force
fi

# --- 3️⃣ Attendre que la base soit prête ---
echo "⏳ Attente de la base de données..."
until php -r "try {
    new PDO(getenv('DB_CONNECTION').':host='.getenv('DB_HOST').';port='.getenv('DB_PORT').';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
    echo '✅ DB OK';
} catch (Exception \$e) {
    echo '⏳ En attente...';
    exit(1);
}"; do
  sleep 2
done

# --- 4️⃣ Exécuter les migrations ---
echo "⚙️ Exécution des migrations..."
if [ ! -f /var/www/html/storage/initialized.flag ]; then
  echo "🆕 Première exécution : réinitialisation complète de la base..."
  php artisan migrate:fresh --force
  php artisan db:seed --force
  touch /var/www/html/storage/initialized.flag
else
  echo "🔁 Migration incrémentale..."
  php artisan migrate --force || true
fi

# --- 5️⃣ Vérification du build Vite ---
echo "⚙️ Vérification du build Vite..."
if [ -f /var/www/html/public/build/manifest.json ]; then
  echo "✅ Build Vite déjà présent."
else
  echo "⚠️ Aucun build détecté dans /public/build/"
  echo "   → Vérifie que ton Dockerfile copie bien :"
  echo "     COPY --from=node_build /app/public/build /var/www/html/public/build"
fi

# --- 6️⃣ Cache Laravel ---
echo "🧩 Mise en cache Laravel..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache || true
php artisan view:cache || true

# --- 6️⃣ bis : forcer le HTTPS en production ---
if [ "$APP_ENV" = "production" ]; then
  php artisan config:clear
  php artisan route:clear
  php artisan optimize
  php artisan storage:link || true
fi

# --- 7️⃣ Fixer les permissions ---
echo "🛠️ Fixation des permissions..."
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

# --- 8️⃣ Démarrer Laravel ---
RENDER_PORT=${PORT:-10000}

echo "🚀 Démarrage du serveur Laravel sur 0.0.0.0:${RENDER_PORT}"

exec php artisan serve --host=0.0.0.0 --port="${RENDER_PORT}"
