#!/bin/sh
set -e

echo "[init] Checking .env file"

# 1) Ensure .env exists
if [ ! -f /var/www/html/.env ]; then
  cp /var/www/html/.env.example /var/www/html/.env
  echo "[init] .env created from .env.example"
fi

# 2) Generate APP_KEY if missing
if ! grep -q "APP_KEY=" /var/www/html/.env || [ -z "$(grep 'APP_KEY=' /var/www/html/.env | cut -d '=' -f2)" ]; then
  echo "[init] Generating APP_KEY"
  php artisan key:generate --force
fi

# 3) Start HTTP server immediately so Render detects the port
RENDER_PORT=${PORT:-10000}
echo "[init] Starting HTTP server on 0.0.0.0:${RENDER_PORT} (background)"
php artisan serve --host=0.0.0.0 --port="${RENDER_PORT}" &
SERVER_PID=$!

# 4) Wait for the database with timeout (supports DATABASE_URL)
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
    echo "[init] DB not ready after ${WAIT_SECONDS}s — continuing without blocking"
    break
  fi
  sleep 1
done

# 5) Run migrations (and seed if empty/forced)
echo "[init] Running migrate/seed"
if ! php artisan app:init; then
  echo "[init] app:init not available, running migrate --force"
  php artisan migrate --force || true
fi

# 6) Check Vite build presence
echo "[init] Checking Vite build"
if [ -f /var/www/html/public/build/manifest.json ]; then
  echo "[init] Vite build present"
else
  echo "[init] No build detected in /public/build/"
  echo "       Ensure Dockerfile copies:"
  echo "       COPY --from=node_build /app/public/build /var/www/html/public/build"
fi

# 7) Cache Laravel
echo "[init] Caching Laravel"
php artisan optimize:clear
php artisan config:cache
php artisan route:cache || true
php artisan view:cache || true

# 7b) Production extras
if [ "$APP_ENV" = "production" ]; then
  php artisan config:clear
  php artisan route:clear
  php artisan optimize
  php artisan storage:link || true
fi

# 8) Permissions
echo "[init] Fixing permissions"
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

# 9) Keep container alive by waiting on the HTTP server
echo "[init] HTTP server running (pid=${SERVER_PID}), waiting..."
wait ${SERVER_PID}

