# 🚀 Guide de Déploiement en Production

Ce guide vous accompagne pas à pas pour déployer **Enma SPA E-commerce** en production de manière sécurisée.

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Préparation du serveur](#préparation-du-serveur)
3. [Configuration de l'environnement](#configuration-de-lenvironnement)
4. [Déploiement de l'application](#déploiement-de-lapplication)
5. [Configuration des services](#configuration-des-services)
6. [Sécurisation](#sécurisation)
7. [Optimisation](#optimisation)
8. [Monitoring et maintenance](#monitoring-et-maintenance)
9. [Dépannage](#dépannage)

---

## 1. Prérequis

### Serveur

- **OS** : Ubuntu 22.04 LTS (recommandé) ou similaire
- **RAM** : Minimum 2 GB (4 GB recommandé)
- **CPU** : 2 cores minimum
- **Disque** : 20 GB minimum (SSD recommandé)
- **Bande passante** : Illimitée ou suffisante pour votre trafic

### Logiciels requis

```bash
# Versions minimales
PHP 8.2+
MySQL 8.0+ (ou MariaDB 10.6+)
Nginx 1.18+ (ou Apache 2.4+)
Node.js 18+
Redis 6.0+ (recommandé)
Composer 2.x
Git 2.x
Supervisor (pour les queues)
```

### Domaine et SSL

- ✅ Nom de domaine configuré (ex: votresite.com)
- ✅ Certificat SSL/TLS (Let's Encrypt gratuit recommandé)

---

## 2. Préparation du serveur

### 2.1 Connexion au serveur

```bash
ssh user@votre-serveur.com
```

### 2.2 Mise à jour du système

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3 Installation de PHP 8.2

```bash
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

sudo apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-common \
    php8.2-mysql php8.2-mbstring php8.2-xml php8.2-bcmath \
    php8.2-curl php8.2-gd php8.2-zip php8.2-intl \
    php8.2-redis php8.2-opcache
```

### 2.4 Installation de Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

### 2.5 Installation de MySQL

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Créer la base de données
sudo mysql
```

```sql
CREATE DATABASE enma_ecommerce_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'enma_user'@'localhost' IDENTIFIED BY 'VotreMotDePasseFort123!';
GRANT ALL PRIVILEGES ON enma_ecommerce_prod.* TO 'enma_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.6 Installation de Redis (recommandé)

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Sécuriser Redis
sudo nano /etc/redis/redis.conf
# Décommenter et définir: requirepass VotreMotDePasseRedis
sudo systemctl restart redis-server
```

### 2.7 Installation de Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### 2.8 Installation de Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2.9 Installation de Supervisor (pour les queues)

```bash
sudo apt install -y supervisor
sudo systemctl enable supervisor
```

---

## 3. Configuration de l'environnement

### 3.1 Créer l'utilisateur dédié (recommandé)

```bash
sudo adduser enma --disabled-password --gecos ""
sudo usermod -aG www-data enma
```

### 3.2 Cloner le projet

```bash
# Se connecter en tant qu'utilisateur enma
sudo su - enma

# Cloner depuis GitHub (ou votre repo)
cd /var/www
git clone https://github.com/votre-username/enma-spa-ecommerce.git
cd enma-spa-ecommerce
```

### 3.3 Configurer les permissions

```bash
sudo chown -R enma:www-data /var/www/enma-spa-ecommerce
sudo chmod -R 755 /var/www/enma-spa-ecommerce
sudo chmod -R 775 /var/www/enma-spa-ecommerce/storage
sudo chmod -R 775 /var/www/enma-spa-ecommerce/bootstrap/cache
```

### 3.4 Configuration .env

```bash
cd /var/www/enma-spa-ecommerce

# Copier le template production
cp .env.production .env

# Éditer avec vos vraies valeurs
nano .env
```

**Variables critiques à configurer** :
- `APP_KEY` : Sera généré à l'étape suivante
- `APP_URL` : https://votre-domaine.com
- `DB_*` : Vos identifiants MySQL
- `MAIL_*` : Configuration SMTP
- `PAYPAL_*` : Clés LIVE PayPal
- `ORANGE_MONEY_*` : Clés LIVE Orange Money
- `WAVE_*` : Clés LIVE Wave
- `REDIS_PASSWORD` : Mot de passe Redis

### 3.5 Générer la clé d'application

```bash
php artisan key:generate
```

### 3.6 Installer les dépendances

```bash
# PHP
composer install --optimize-autoloader --no-dev

# JavaScript
npm ci --production
npm run build
```

---

## 4. Déploiement de l'application

### 4.1 Exécuter les migrations

```bash
php artisan migrate --force
```

⚠️ **Ne PAS exécuter `db:seed` en production** (sauf si vous avez des données initiales nécessaires)

### 4.2 Créer le lien symbolique storage

```bash
php artisan storage:link
```

### 4.3 Créer le compte admin de production

```bash
php artisan tinker
```

```php
$admin = \App\Models\User::create([
    'name' => 'Administrateur',
    'email' => 'admin@votre-domaine.com',
    'password' => bcrypt('VotreMotDePasseTresFort123!@#'),
    'email_verified_at' => now(),
    'status' => 1,
]);

$admin->assignRole('Admin');
exit;
```

### 4.4 Optimiser l'application

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

---

## 5. Configuration des services

### 5.1 Configuration Nginx

Créer le fichier de configuration :

```bash
sudo nano /etc/nginx/sites-available/enma-ecommerce
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name votre-domaine.com www.votre-domaine.com;
    
    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    root /var/www/enma-spa-ecommerce/public;
    index index.php index.html;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Logs
    access_log /var/log/nginx/enma-access.log;
    error_log /var/log/nginx/enma-error.log;

    # Client max body size (pour uploads)
    client_max_body_size 20M;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Cache des assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/enma-ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5.2 Installation du certificat SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

Renouvellement automatique :
```bash
sudo systemctl enable certbot.timer
```

### 5.3 Configuration PHP-FPM

```bash
sudo nano /etc/php/8.2/fpm/pool.d/www.conf
```

Ajuster :
```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500
```

Optimisations PHP :
```bash
sudo nano /etc/php/8.2/fpm/php.ini
```

```ini
memory_limit = 256M
upload_max_filesize = 20M
post_max_size = 20M
max_execution_time = 60
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.validate_timestamps=0
```

Redémarrer PHP-FPM :
```bash
sudo systemctl restart php8.2-fpm
```

### 5.4 Configuration Supervisor (Queue Workers)

```bash
sudo nano /etc/supervisor/conf.d/enma-worker.conf
```

```ini
[program:enma-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/enma-spa-ecommerce/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=enma
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/enma-spa-ecommerce/storage/logs/worker.log
stopwaitsecs=3600
```

Activer :
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start enma-worker:*
```

---

## 6. Sécurisation

### 6.1 Firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### 6.2 Fail2Ban (protection brute-force)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 6.3 Permissions finales

```bash
cd /var/www/enma-spa-ecommerce
sudo chown -R enma:www-data .
sudo find . -type f -exec chmod 644 {} \;
sudo find . -type d -exec chmod 755 {} \;
sudo chmod -R 775 storage bootstrap/cache
sudo chmod 600 .env
```

### 6.4 Désactiver les fonctions PHP dangereuses

```bash
sudo nano /etc/php/8.2/fpm/php.ini
```

```ini
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source
```

### 6.5 Changer les mots de passe par défaut

```bash
php artisan tinker
```

```php
// Supprimer les utilisateurs de test
\App\Models\User::where('email', 'john@example.com')->delete();

// Changer le mot de passe admin si nécessaire
$admin = \App\Models\User::where('email', 'admin@enma-shop.com')->first();
if ($admin) {
    $admin->email = 'admin@votre-domaine.com';
    $admin->password = bcrypt('NouveauMotDePasseTresFort');
    $admin->save();
}
exit;
```

---

## 7. Optimisation

### 7.1 Vérifier que toutes les optimisations sont actives

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan optimize
```

### 7.2 Configurer les tâches planifiées (Cron)

```bash
sudo crontab -e -u enma
```

Ajouter :
```
* * * * * cd /var/www/enma-spa-ecommerce && php artisan schedule:run >> /dev/null 2>&1
```

### 7.3 Monitoring des logs

```bash
# Créer un logrotate
sudo nano /etc/logrotate.d/laravel
```

```
/var/www/enma-spa-ecommerce/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 enma www-data
    sharedscripts
}
```

---

## 8. Monitoring et maintenance

### 8.1 Vérification de santé

```bash
# Status des services
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status mysql
sudo systemctl status redis-server
sudo systemctl status supervisor

# Logs Laravel
tail -f /var/www/enma-spa-ecommerce/storage/logs/laravel.log

# Workers
sudo supervisorctl status enma-worker:*
```

### 8.2 Sauvegardes automatiques

Créer un script de backup :

```bash
sudo nano /usr/local/bin/backup-enma.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/enma"
DB_NAME="enma_ecommerce_prod"
DB_USER="enma_user"
DB_PASS="VotreMotDePasse"

mkdir -p $BACKUP_DIR

# Backup base de données
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup fichiers
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/enma-spa-ecommerce/storage/app/public

# Supprimer les backups > 30 jours
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
sudo chmod +x /usr/local/bin/backup-enma.sh

# Ajouter au cron (tous les jours à 2h du matin)
sudo crontab -e
```

```
0 2 * * * /usr/local/bin/backup-enma.sh >> /var/log/backup-enma.log 2>&1
```

### 8.3 Monitoring avec Sentry (optionnel)

```bash
composer require sentry/sentry-laravel
php artisan sentry:publish --dsn=https://xxx@sentry.io/xxx
php artisan config:cache
```

---

## 9. Dépannage

### Erreur 500

```bash
# Vérifier les logs
tail -100 /var/www/enma-spa-ecommerce/storage/logs/laravel.log
tail -100 /var/log/nginx/enma-error.log

# Vérifier les permissions
ls -la /var/www/enma-spa-ecommerce/storage
```

### Workers ne fonctionnent pas

```bash
sudo supervisorctl status
sudo supervisorctl restart enma-worker:*
tail -f /var/www/enma-spa-ecommerce/storage/logs/worker.log
```

### Base de données inaccessible

```bash
sudo systemctl status mysql
mysql -u enma_user -p enma_ecommerce_prod
```

### Cache invalide

```bash
php artisan optimize:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

---

## ✅ Checklist finale

- [ ] APP_DEBUG=false dans .env
- [ ] APP_URL configuré avec HTTPS
- [ ] Certificat SSL actif
- [ ] Base de données configurée et accessible
- [ ] Migrations exécutées
- [ ] Compte admin créé avec mot de passe fort
- [ ] Comptes de test supprimés
- [ ] Storage link créé
- [ ] Caches Laravel générés
- [ ] Nginx configuré et testé
- [ ] PHP-FPM optimisé
- [ ] Supervisor configuré pour les queues
- [ ] Firewall activé (UFW)
- [ ] Fail2Ban installé
- [ ] Permissions fichiers correctes
- [ ] Cron configuré pour le scheduler
- [ ] Backups automatiques configurés
- [ ] Redis configuré et sécurisé
- [ ] Emails testés (envoi de test)
- [ ] Paiements testés (sandbox puis live)
- [ ] Logs rotatés automatiquement
- [ ] Monitoring configuré

---

**Votre application est maintenant en production ! 🎉**

Pour toute question ou problème, consultez la documentation Laravel ou créez une issue sur GitHub.
