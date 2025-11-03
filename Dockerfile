# Étape de base : PHP / Laravel
FROM php:8.2-fpm AS base

# Paquets système requis + GD avec support WebP/JPEG/FreeType
RUN apt-get update && apt-get install -y \
    git unzip zip libpng-dev libjpeg62-turbo-dev libfreetype6-dev libwebp-dev \
    libonig-dev libxml2-dev libzip-dev libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip

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
# Copier uniquement le dossier de build Vite pour éviter d'écraser d'autres fichiers de /public
COPY --from=node_build /app/public/build /var/www/html/public/build


# Override entrypoint with sanitized script for production (no built-in server)
COPY scripts/entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Définir l’entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Exposer le port 9000
EXPOSE 9000

# Commande par défaut (lancée après l’entrypoint)
CMD ["php-fpm"]

