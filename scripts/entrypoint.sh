#!/bin/sh
set -e

echo "[init] Starting Laravel entrypoint (PHP-FPM mode)"

# 1) Ensure .env exists
if [ ! -f /var/www/html/.env ]; then
  cp /var/www/html/.env.example /var/www/html/.env
  echo "[init] .env created from .env.example"
fi

# 2) Ensure APP_KEY
ENV_HAS_APP_KEY=$(php -r 'echo getenv("APP_KEY") ? "1" : "";')
FILE_HAS_APP_KEY=$(grep -E "^APP_KEY=" /var/www/html/.env 2>/dev/null | cut -d '=' -f2-)
if [ -n "$ENV_HAS_APP_KEY" ]; then
  echo "[init] APP_KEY found in environment"
elif [ -n "$FILE_HAS_APP_KEY" ]; then
  echo "[init] APP_KEY found in .env"
else
  echo "[init] APP_KEY missing - generating via artisan"
  php artisan key:generate --force
fi

# 3) Wait for the database with timeout (supports DATABASE_URL)
WAIT_SECONDS=${WAIT_FOR_DB_TIMEOUT:-45}
echo "[init] Waiting for database (max ${WAIT_SECONDS}s)"
ITER=0
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
try { new PDO($dsn, $user, $pass); } catch (Exception $e) { exit(1); }
'; do
  ITER=$((ITER+1))
  if [ "$ITER" -ge "$WAIT_SECONDS" ]; then
    echo "[init] DB not ready after ${WAIT_SECONDS}s - continuing"
    break
  fi
  sleep 1
done

# 4) Run migrations (and seed if empty/forced)
echo "[init] Running migrate/seed"
if ! php artisan app:init; then
  echo "[init] app:init not available, running migrate --force"
  php artisan migrate --force || true
fi

# 5) Optimize and cache configuration/routes/views
echo "[init] Caching Laravel"
php artisan optimize:clear
php artisan config:cache
php artisan route:cache || true
php artisan view:cache || true

# 6) Production extras
if [ "$APP_ENV" = "production" ]; then
  php artisan optimize
  php artisan storage:link || true
fi

# 7) Permissions
echo "[init] Fixing permissions"
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

echo "[init] Entrypoint completed. php-fpm should be launched by CMD."

