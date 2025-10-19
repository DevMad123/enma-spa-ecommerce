#!/bin/sh
set -e

echo "[init] Vérification du fichier .env..."

# 1) Créer .env si absent
if [ ! -f /var/www/html/.env ]; then
  cp /var/www/html/.env.example /var/www/html/.env
  echo "[init] .env créé depuis .env.example"
fi

# 2) Générer la clé Laravel si manquante
if ! grep -q "APP_KEY=" /var/www/html/.env || [ -z "$(grep 'APP_KEY=' /var/www/html/.env | cut -d '=' -f2)" ]; then
  echo "[init] Génération de la clé d'application..."
  php artisan key:generate --force
fi

# 3) Attendre que la base soit prête (supporte DATABASE_URL)
echo "[init] Attente de la base de données..."
until php -r '
$dsn = null; $user = null; $pass = null;
$url = getenv("DATABASE_URL");
if ($url) {
    $p = parse_url($url);
    if ($p) {
        $scheme = $p["scheme"] ?? "pgsql";
        $host = $p["host"] ?? "127.0.0.1";
        $port = $p["port"] ?? ($scheme === "mysql" ? 3306 : 5432);
        $db = ltrim($p["path"] ?? "", "/");
        $user = $p["user"] ?? null;
        $pass = $p["pass"] ?? null;
        $dsn = $scheme . ":host=" . $host . ";port=" . $port . ";dbname=" . $db;
    }
}
if (!$dsn) {
    $scheme = getenv("DB_CONNECTION") ?: "pgsql";
    $host = getenv("DB_HOST") ?: "127.0.0.1";
    $port = getenv("DB_PORT") ?: ($scheme === "mysql" ? 3306 : 5432);
    $db = getenv("DB_DATABASE") ?: "forge";
    $user = getenv("DB_USERNAME") ?: "forge";
    $pass = getenv("DB_PASSWORD") ?: "";
    $dsn = $scheme . ":host=" . $host . ";port=" . $port . ";dbname=" . $db;
}
try {
    new PDO($dsn, $user, $pass);
    echo "DB OK";
} catch (Exception $e) {
    echo "waiting...";
    exit(1);
}
'; do
  sleep 2
done

# 4) Migrer (et éventuellement seed si vide ou forcé)
echo "[init] Préparation de la base (migrate + seed si vide/forcé)..."
if ! php artisan app:init; then
  echo "[init] Commande app:init indisponible, fallback sur migrate --force"
  php artisan migrate --force || true
fi

# 5) Vérification du build Vite
echo "[init] Vérification du build Vite..."
if [ -f /var/www/html/public/build/manifest.json ]; then
  echo "[init] Build Vite déjà présent."
else
  echo "[init] Aucun build détecté dans /public/build/"
  echo "       Vérifie que le Dockerfile copie bien:"
  echo "       COPY --from=node_build /app/public/build /var/www/html/public/build"
fi

# 6) Cache Laravel
echo "[init] Mise en cache Laravel..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache || true
php artisan view:cache || true

# 6 bis) production: optimisations + stockage
if [ "$APP_ENV" = "production" ]; then
  php artisan config:clear
  php artisan route:clear
  php artisan optimize
  php artisan storage:link || true
fi

# 7) Permissions
echo "[init] Fixation des permissions..."
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

# 8) Démarrer Laravel (Render utilise $PORT)
RENDER_PORT=${PORT:-10000}
echo "[init] Démarrage du serveur Laravel sur 0.0.0.0:${RENDER_PORT}"
exec php artisan serve --host=0.0.0.0 --port="${RENDER_PORT}"

