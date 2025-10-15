# Étape 1 : image de base PHP pour servir Laravel
FROM php:8.2-fpm AS php_base

# Installer les dépendances nécessaires pour Laravel, ext, etc.
RUN apt-get update && apt-get install -y \
    git unzip zip libpng-dev libonig-dev libxml2-dev libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Installer Composer (le binaire) dans l’image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copier tout le code source
COPY . .

# Installer les dépendances backend avec Composer
RUN composer install --no-dev --optimize-autoloader

# Générer le key, cacher config, etc.
RUN php artisan key:generate
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

# Étape 2 : build du frontend (React / Inertia)
FROM node:18 AS node_build

WORKDIR /app
# Copier les fichiers package.json, etc.
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape finale : relier frontend + backend
FROM php_base AS final

# Copier les fichiers du build frontend vers le dossier public de Laravel
COPY --from=node_build /app/public /var/www/html/public

# Permissions (si besoin)
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Exposer le port HTTP
EXPOSE 80

# Commande de démarrage (ici PHP-FPM, tu peux adapter selon ton setup)
CMD ["php-fpm"]
