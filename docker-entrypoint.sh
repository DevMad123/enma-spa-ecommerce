#!/bin/sh
set -e

echo "🔍 Vérification du fichier .env..."

# --- 1️⃣ Génération du .env si nécessaire ---
if [ ! -f /var/www/html/.env ]; then
  cp /var/www/html/.env.example /var/www/html/.env
  echo "✅ .env créé depuis .env.example"
fi

# --- 2️⃣ Générer la clé d'application si absente ---
if ! grep -q "APP_KEY=" /var/www/html/.env || [ -z "$(grep 'APP_KEY=' /var/www/html/.env | cut -d '=' -f2)" ]; then
  echo "🔑 Génération de la clé d’application..."
  php artisan key:generate --force
fi

# --- Build Vite (important pour Render production) ---
echo "⚙️ Installation des dépendances et build Vite..."
npm ci
npm run build

# --- 3️⃣ Attendre que la base de données soit prête ---
echo "⏳ Attente de la base de données..."
until php -r "try { new PDO(getenv('DB_CONNECTION').':host='.getenv('DB_HOST').';port='.getenv('DB_PORT').';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); echo '✅ DB OK'; } catch (Exception \$e) { echo '⏳ En attente...'; exit(1); }"; do
  sleep 2
done

# --- 4️⃣ Exécuter les migrations en toute sécurité ---
echo "⚙️ Exécution des migrations..."
php artisan migrate --force || {
  echo "⚠️ Erreur pendant les migrations. Tentative de correction..."
  php artisan migrate:install --force || true
  php artisan migrate --force || true
}

# --- 5️⃣ Mettre en cache la configuration, routes et vues ---
echo "🧩 Mise en cache Laravel..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache || true
php artisan view:cache || true

# --- 6️⃣ Fixer les permissions ---
echo "🛠️ Fixation des permissions..."
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

# --- 7️⃣ Lancer le serveur Laravel ---
RENDER_PORT=${PORT:-8000}
echo "🚀 Démarrage du serveur Laravel sur 0.0.0.0:${RENDER_PORT}"

exec php artisan serve --host=0.0.0.0 --port="${RENDER_PORT}"
