# ------------------------------------------------------------
# 🧱 Étape 1 : Composer (installation des dépendances Laravel)
# ------------------------------------------------------------
FROM composer:2 AS vendor

WORKDIR /app

# Copier les fichiers de configuration
COPY composer.json composer.lock ./

# ✅ Installer les dépendances (y compris require-dev pour Faker/Seeders)
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Copier tout le code Laravel
COPY . .

# ------------------------------------------------------------
# ⚙️ Étape 2 : Build du frontend (Vite / React)
# ------------------------------------------------------------
FROM node:18 AS node_build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ------------------------------------------------------------
# 🚀 Étape 3 : Image finale PHP (Render)
# ------------------------------------------------------------
FROM php:8.2-fpm AS final

# Installer extensions PHP et utilitaires nécessaires
RUN apt-get update && apt-get install -y \
    git unzip zip libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev \
    && docker-php-ext-install pdo_mysql pdo_pgsql pgsql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Copier Composer binaire
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copier le code Laravel + vendor depuis l’étape vendor
COPY --from=vendor /app /var/www/html

# Copier uniquement le build Vite
COPY --from=node_build /app/public/build /var/www/html/public/build

# Copier le script d’entrée
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Donner les bons droits
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 10000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
