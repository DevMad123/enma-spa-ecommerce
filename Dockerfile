# Étape 1 : base PHP
FROM php:8.2-fpm AS base

RUN apt-get update && apt-get install -y \
    git unzip zip libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev \
    && docker-php-ext-install pdo_mysql pdo_pgsql pgsql mbstring exif pcntl bcmath gd zip

# Copier Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

# Installer les dépendances Laravel
RUN composer install --no-dev --optimize-autoloader

# Étape 2 : build frontend (Vite/React)
FROM node:18 AS node_build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 3 : image finale (Render)
FROM php:8.2-fpm AS final

RUN apt-get update && apt-get install -y libpq-dev && docker-php-ext-install pdo_pgsql

WORKDIR /var/www/html
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=base /var/www/html /var/www/html
# ✅ important : copie SEULEMENT le build
COPY --from=node_build /app/public/build /var/www/html/public/build   
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 10000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
