# ------------------------------------------------------------
# 🧱 Étape 1 : Base PHP (Composer & dépendances Laravel)
# ------------------------------------------------------------
FROM php:8.2-fpm AS base

RUN apt-get update && apt-get install -y \
    git unzip zip libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev \
    && docker-php-ext-install pdo_mysql pdo_pgsql pgsql mbstring exif pcntl bcmath gd zip

RUN php -m | grep zip || echo "❌ ZIP extension not loaded!"
# Copier Composer depuis son image officielle
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

# Installer les dépendances Laravel
RUN composer install --no-dev --optimize-autoloader


# ------------------------------------------------------------
# ⚙️ Étape 2 : Build du frontend (Vite / React)
# ------------------------------------------------------------
FROM node:18 AS node_build
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour npm install
COPY package*.json ./

RUN npm ci
COPY . .

RUN npm run build


# ------------------------------------------------------------
# 🚀 Étape 3 : Image finale (déployée sur Render)
# ------------------------------------------------------------
FROM php:8.2-fpm AS final

# Installer extensions nécessaires pour la DB
RUN apt-get update && apt-get install -y libpq-dev && docker-php-ext-install pdo_pgsql

WORKDIR /var/www/html

# Copier Composer et le code Laravel compilé
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=base /var/www/html /var/www/html

# ✅ Copier uniquement le build final du front
COPY --from=node_build /app/public/build /var/www/html/public/build

# Copier le script d’entrée
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Donner les bons droits
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 10000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
