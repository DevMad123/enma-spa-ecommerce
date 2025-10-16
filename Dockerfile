# Étape de base : PHP / Laravel
FROM php:8.2-fpm AS base

RUN apt-get update && apt-get install -y \
    git unzip zip libpng-dev libonig-dev libxml2-dev libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Copier le binaire Composer depuis l’image Composer officielle
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copier tout le code source
COPY . .

# Installer les dépendances backend
RUN composer install --no-dev --optimize-autoloader

# Étape de build frontend (React / Inertia)
FROM node:18 AS node_build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape finale : assembler backend + frontend
FROM base AS final

# Copier le build frontend vers le dossier public de Laravel
COPY --from=node_build /app/public /var/www/html/public

# Donner les bonnes permissions à Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Exposer le port utilisé par Render
EXPOSE 10000

# Démarrer Laravel sur le port assigné par Render
CMD php artisan serve --host=0.0.0.0 --port=$PORT
