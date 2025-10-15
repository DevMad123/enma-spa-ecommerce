# Étape de base : PHP / Laravel
FROM php:8.2-fpm AS base

RUN apt-get update && apt-get install -y \
    git unzip zip libpng-dev libonig-dev libxml2-dev libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Copier le binaire Composer depuis image composer officielle
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copier tout le code (y compris docker-entrypoint.sh, .env.example, etc.)
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

# Étape finale : assembler backend + frontend + entrypoint
FROM base AS final

# Copier le build frontend vers le dossier public de Laravel
COPY --from=node_build /app/public /var/www/html/public

# Copier le script entrypoint dans l’image
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Définir l’entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Exposer le port 9000
EXPOSE 9000

# Commande par défaut (lancée après l’entrypoint)
CMD ["php-fpm"]
