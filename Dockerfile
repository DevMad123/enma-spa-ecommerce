# ===============================
# Étape 1 : Builder les assets (React / Inertia)
# ===============================
FROM node:18 AS node_builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ===============================
# Étape 2 : Serveur PHP + Apache
# ===============================
FROM php:8.2-apache

# Installer les extensions nécessaires à Laravel
RUN apt-get update && apt-get install -y \
    git unzip zip libzip-dev libpng-dev libonig-dev libxml2-dev libjpeg-dev libfreetype6-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring zip exif pcntl bcmath gd

# Installer Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copier le code du projet
WORKDIR /var/www/html
COPY . .

# Copier les assets compilés depuis l'étape Node
COPY --from=node_builder /app/public /var/www/html/public

# Donner les permissions à Laravel
RUN chown -R www-data:www-data storage bootstrap/cache

# Activer mod_rewrite d’Apache
RUN a2enmod rewrite

# Exposer le port 80
EXPOSE 80

# Générer la clé Laravel et lancer le serveur
CMD composer install --no-dev --optimize-autoloader && \
    php artisan key:generate && \
    php artisan migrate --force && \
    apache2-foreground
