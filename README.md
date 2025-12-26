# Enma SPA E-commerce

Une plateforme e-commerce complète développée avec Laravel 11 et React, utilisant Inertia.js pour une expérience SPA moderne et performante.

## 📋 Table des matières

- [Présentation du projet](#présentation-du-projet)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation locale](#installation-locale)
- [Configuration](#configuration)
- [Commandes utiles](#commandes-utiles)
- [Structure du projet](#structure-du-projet)
- [Déploiement](#déploiement)
- [Bonnes pratiques & sécurité](#bonnes-pratiques--sécurité)
- [Contribution](#contribution)
- [Licence](#licence)

---

## 🎯 Présentation du projet

**Enma SPA E-commerce** est une plateforme e-commerce complète permettant la gestion de produits, commandes, paiements, et clients. Le projet intègre des fonctionnalités avancées telles que :

- **Gestion de produits** : Produits simples et variables avec attributs (couleurs, tailles), images multiples, et variations de prix
- **Système de paiement** : Intégration de PayPal, Orange Money et Wave pour les paiements en ligne
- **Gestion des commandes** : Suivi complet des ventes, paiements, et expéditions
- **Interface d'administration** : Dashboard complet avec statistiques, gestion des utilisateurs, produits, marques, catégories
- **Système de notification** : Notifications en temps réel pour les commandes et messages
- **Newsletter et contact** : Gestion des abonnés newsletter et messages de contact
- **Multi-devise** : Support de plusieurs devises (notamment XOF pour l'Afrique de l'Ouest)
- **Wishlist et avis** : Gestion des listes de souhaits et des avis clients
- **Customisation frontend** : Personnalisation des slides, galerie, et liens mis en avant

### Objectif principal

Fournir une solution e-commerce clé en main, modulaire et extensible, adaptée aux marchés locaux (notamment africains) avec support des moyens de paiement locaux.

---

## 🛠 Stack technique

### Backend
- **Framework** : Laravel 11.x (PHP 8.2+)
- **Architecture** : MVC avec Inertia.js
- **Authentification** : Laravel Sanctum
- **API REST** : Routes API pour communication frontend-backend
- **ORM** : Eloquent
- **Queue** : Support des files d'attente (database driver)
- **Validation** : Form Requests personnalisés
- **Helpers** : CurrencyHelper, LocaleHelper pour la gestion des devises et langues

### Frontend
- **Framework UI** : React 18.2
- **Routing** : React Router DOM 7.8 + Inertia.js 2.1
- **State Management** : Redux Toolkit 2.9
- **Styling** : 
  - Tailwind CSS 3.2 avec @tailwindcss/forms
  - Material-UI 7.3
  - Emotion (styled components)
- **Composants UI** :
  - Headless UI 1.4
  - Heroicons 2.1
  - React Icons 5.5
  - Swiper 11.2 (carousels)
  - Framer Motion 12.23 (animations)
- **Notifications** : React Toastify 11.0
- **Build Tool** : Vite 5.0 avec laravel-vite-plugin

### Base de données
- **SGBD principal** : MySQL 8.0+ (support également de PostgreSQL et SQLite)
- **Migrations** : Gestion versionnée du schéma
- **Seeders** : Données de démonstration disponibles

### Outils & dépendances complémentaires
- **Tests** : Pest 2.0 (framework de test PHP moderne)
- **Qualité du code** : Laravel Pint 1.13 (formatage)
- **Images** : Intervention Image 3.11 (manipulation d'images)
- **Paiements** : PayPal REST API SDK 1.6
- **Développement** : 
  - Laravel Breeze 2.0 (authentification)
  - Laravel Sail 1.26 (environnement Docker optionnel)
  - Ziggy 1.0 (routes Laravel accessibles en JavaScript)
- **Conteneurisation** : Docker + docker-compose (Dockerfile fourni)
- **Déploiement** : Configuration Render.com (render.yaml)

---

## ⚙️ Prérequis

### Logiciels nécessaires

- **PHP** : Version 8.2 ou supérieure
- **Composer** : Version 2.x
- **Node.js** : Version 18.x ou supérieure
- **npm** : Version 8.x ou supérieure
- **MySQL** : Version 8.0 ou supérieure (ou MariaDB 10.3+)
- **Git** : Pour cloner le dépôt

### Extensions PHP requises

```
php-xml
php-mbstring
php-gd (avec support WebP, JPEG, FreeType)
php-zip
php-mysql (ou php-pgsql pour PostgreSQL)
php-bcmath
php-exif
php-pcntl
```

### Recommandations

- **Système d'exploitation** : Linux/macOS (Windows via WSL2 ou Docker)
- **Serveur web** : Nginx ou Apache (optionnel en développement)
- **Mémoire PHP** : Au moins 256 MB (`memory_limit=256M`)

---

## 🚀 Installation locale

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-username/enma-spa-ecommerce.git
cd enma-spa-ecommerce
```

### 2. Installer les dépendances backend

```bash
composer install
```

### 3. Installer les dépendances frontend

```bash
npm install
```

### 4. Configuration de l'environnement

Créer le fichier `.env` à partir du fichier d'exemple :

```bash
cp .env.example .env
```

**Important** : Modifier le fichier `.env` avec vos paramètres locaux (voir section [Configuration](#configuration)).

### 5. Générer la clé d'application

```bash
php artisan key:generate
```

### 6. Créer la base de données

Créer une base de données MySQL :

```bash
mysql -u root -p
```

```sql
CREATE DATABASE enma_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 7. Exécuter les migrations

```bash
php artisan migrate
```

### 8. (Optionnel) Générer des données de test

```bash
php artisan db:seed
```

Cela créera des données de démonstration incluant :
- Utilisateurs (admin, clients)
- Produits avec variations
- Catégories et marques
- Commandes et paiements
- Messages de contact et abonnés newsletter

### 9. Créer le lien symbolique pour le storage

```bash
php artisan storage:link
```

### 10. Compiler les assets frontend

**En mode développement** (avec hot reload) :

```bash
npm run dev
```

**Pour la production** :

```bash
npm run build
```

### 11. Démarrer le serveur de développement

Dans un nouveau terminal :

```bash
php artisan serve
```

L'application sera accessible sur : `http://localhost:8000`

---

## 🔧 Configuration

### Variables d'environnement importantes

#### Application

```dotenv
APP_NAME='Enma Ecommerce'
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_KEY=                        # Généré avec php artisan key:generate
```

#### Base de données (MySQL)

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=enma_ecommerce
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

> **Note** : Le projet supporte également PostgreSQL et SQLite. Pour PostgreSQL, utilisez `DB_CONNECTION=pgsql` et ajustez le port (5432).

#### Paiements

**PayPal** :
```dotenv
PAYPAL_MODE=sandbox                    # ou 'live' en production
PAYPAL_SANDBOX_CLIENT_ID=votre_client_id
PAYPAL_SANDBOX_CLIENT_SECRET=votre_secret
PAYPAL_CURRENCY=XOF
PAYPAL_LOCALE=fr_FR
```

**Orange Money** :
```dotenv
ORANGE_MONEY_MODE=sandbox
ORANGE_MONEY_SANDBOX_CLIENT_ID=votre_client_id
ORANGE_MONEY_SANDBOX_CLIENT_SECRET=votre_secret
ORANGE_MONEY_SANDBOX_MERCHANT_KEY=votre_merchant_key
ORANGE_MONEY_CURRENCY=XOF
ORANGE_MONEY_LOCALE=fr_FR
```

**Wave** :
```dotenv
WAVE_MODE=sandbox
WAVE_SANDBOX_API_KEY=votre_api_key
WAVE_SANDBOX_SECRET_KEY=votre_secret_key
WAVE_CURRENCY=XOF
```

#### Email

```dotenv
MAIL_MAILER=smtp                       # ou 'log' en développement
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=votre_username
MAIL_PASSWORD=votre_password
MAIL_FROM_ADDRESS="noreply@enma-ecommerce.com"
MAIL_FROM_NAME="${APP_NAME}"
```

#### Cache et Sessions

```dotenv
CACHE_STORE=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database
```

### Permissions (Linux/macOS)

Assurez-vous que les dossiers suivants sont accessibles en écriture :

```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache  # Ajuster selon votre utilisateur web
```

### Configuration avancée

- **Fichiers de configuration** disponibles dans `config/` :
  - [config/database.php](config/database.php) : Configuration des connexions base de données
  - [config/queue.php](config/queue.php) : Configuration des files d'attente
  - [config/sanctum.php](config/sanctum.php) : Configuration de l'authentification API
  - [config/services.php](config/services.php) : Services tiers (PayPal, etc.)

---

## 📝 Commandes utiles

### Commandes Artisan

```bash
# Initialisation complète (migrations + seeders si base vide)
php artisan app:init

# Gestion de la base de données
php artisan migrate                    # Exécuter les migrations
php artisan migrate:fresh --seed       # Réinitialiser la base + seeders
php artisan migrate:rollback           # Annuler la dernière migration
php artisan db:seed                    # Exécuter les seeders

# Cache et optimisation
php artisan optimize                   # Optimiser l'application
php artisan optimize:clear             # Nettoyer tous les caches
php artisan config:cache               # Mettre en cache la configuration
php artisan route:cache                # Mettre en cache les routes
php artisan view:cache                 # Mettre en cache les vues

# Storage
php artisan storage:link               # Créer le lien symbolique

# Commandes personnalisées
php artisan recalc:variable-prices     # Recalculer les prix des produits variables
php artisan recalc:variable-prices --dry-run  # Simulation sans modification

# Lancer le serveur de développement
php artisan serve                      # http://localhost:8000
php artisan serve --host=0.0.0.0 --port=8080  # Serveur accessible réseau
```

### Commandes NPM

```bash
# Développement
npm run dev                            # Démarrer Vite en mode développement (hot reload)

# Production
npm run build                          # Compiler les assets pour la production

# Installation
npm install                            # Installer les dépendances
npm install --legacy-peer-deps         # Si conflits de dépendances
```

### Commandes de test

```bash
# Tests avec Pest
php artisan test                       # Exécuter tous les tests
php artisan test --filter NomDuTest    # Exécuter un test spécifique

# Tests avec PHPUnit (si configuré)
./vendor/bin/phpunit
```

### Docker (optionnel)

```bash
# Construire l'image
docker build -t enma-ecommerce .

# Démarrer avec docker-compose (si vous créez un docker-compose.yml)
docker-compose up -d

# Laravel Sail (environnement de développement Docker)
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate
./vendor/bin/sail npm run dev
```

---

## 📁 Structure du projet

```
enma-spa-ecommerce/
├── app/
│   ├── Console/
│   │   └── Commands/              # Commandes Artisan personnalisées
│   ├── Helpers/
│   │   ├── CurrencyHelper.php     # Gestion des devises et formats de prix
│   │   └── LocaleHelper.php       # Gestion des locales et langues
│   ├── Http/
│   │   ├── Controllers/           # Contrôleurs (Admin, API, Frontend)
│   │   ├── Middleware/            # Middlewares personnalisés
│   │   ├── Requests/              # Form Requests (validation)
│   │   └── Resources/             # API Resources (transformation données)
│   ├── Mail/                      # Classes d'emails (commandes, etc.)
│   ├── Models/                    # Modèles Eloquent (Product, Sell, User, etc.)
│   ├── Notifications/             # Notifications système
│   └── Services/                  # Services métier
│
├── bootstrap/
│   ├── app.php                    # Bootstrap de l'application
│   └── cache/                     # Fichiers de cache de démarrage
│
├── config/                        # Fichiers de configuration Laravel
│   ├── database.php               # Configuration BDD
│   ├── queue.php                  # Configuration files d'attente
│   └── ...
│
├── database/
│   ├── factories/                 # Factories pour les tests
│   ├── migrations/                # Migrations de base de données
│   └── seeders/                   # Seeders (données de test)
│
├── docs/                          # Documentation technique du projet
│   ├── PAYMENT_SYSTEM_STATUS.md   # Documentation système de paiement
│   ├── GUIDE_UTILISATION.md       # Guide d'utilisation
│   ├── PAYPAL_INTEGRATION.md      # Intégration PayPal
│   ├── ORANGE_MONEY_INTEGRATION.md
│   └── ...
│
├── public/
│   ├── build/                     # Assets compilés par Vite (générés)
│   ├── images/                    # Images publiques
│   └── index.php                  # Point d'entrée de l'application
│
├── resources/
│   ├── css/
│   │   └── app.css                # Styles globaux + Tailwind
│   ├── js/
│   │   ├── app.jsx                # Point d'entrée React + Inertia
│   │   ├── Pages/                 # Pages React/Inertia
│   │   ├── Layouts/               # Layouts (Frontend, Admin, Auth)
│   │   ├── Components/            # Composants React réutilisables
│   │   ├── redux/                 # Store Redux et slices
│   │   └── Utils/                 # Utilitaires JavaScript
│   └── views/                     # Vues Blade (minimal avec Inertia)
│
├── routes/
│   ├── api.php                    # Routes API
│   ├── web.php                    # Routes web principales
│   ├── auth.php                   # Routes d'authentification
│   └── console.php                # Commandes console (Artisan)
│
├── storage/
│   ├── app/                       # Fichiers de l'application
│   ├── framework/                 # Fichiers du framework (cache, sessions)
│   └── logs/                      # Logs de l'application
│
├── tests/
│   ├── Feature/                   # Tests de fonctionnalités
│   └── Unit/                      # Tests unitaires
│
├── .env.example                   # Exemple de configuration environnement
├── artisan                        # CLI Artisan
├── composer.json                  # Dépendances PHP
├── package.json                   # Dépendances JavaScript
├── vite.config.js                 # Configuration Vite
├── tailwind.config.js             # Configuration Tailwind CSS
├── phpunit.xml                    # Configuration des tests
├── Dockerfile                     # Configuration Docker
├── docker-entrypoint.sh           # Script d'initialisation Docker
└── render.yaml                    # Configuration déploiement Render.com
```

### Modèles principaux

Le dossier `app/Models/` contient plus de 50 modèles, dont les principaux :
- **Produits** : `Product`, `ProductVariant`, `ProductAttribute`, `ProductCategory`, `ProductReview`
- **Ventes** : `Sell`, `Sell_details`, `SellOrderAddress`, `Payment`
- **Utilisateurs** : `User`, `Ecommerce_customer`, `Role`, `Permission`
- **Paiements** : `Payment`, `PaymentMethod`, `Online_payment_details`, `Money_transaction`
- **Contenu** : `Brand`, `Newsletter`, `ContactMessage`, `Notification`
- **Configuration** : `Setting`, `Currency`, `Language_setting`, `CompanyInfo`

---

## 🚀 Déploiement

### Étapes générales de déploiement

1. **Configurer l'environnement de production**
   ```bash
   APP_ENV=production
   APP_DEBUG=false
   ```

2. **Optimiser les performances**
   ```bash
   composer install --optimize-autoloader --no-dev
   npm run build
   php artisan optimize
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. **Configurer la base de données**
   - Créer la base de données en production
   - Configurer les variables `DB_*` dans `.env`
   - Exécuter les migrations : `php artisan migrate --force`

4. **Configurer le stockage**
   ```bash
   php artisan storage:link
   chmod -R 775 storage bootstrap/cache
   ```

5. **Configurer les workers de queue (optionnel)**
   ```bash
   php artisan queue:work --daemon
   ```

### Déploiement avec Docker

Le projet inclut un `Dockerfile` et un script `docker-entrypoint.sh` pour faciliter le déploiement :

```bash
# Construire l'image
docker build -t enma-ecommerce:latest .

# Démarrer le conteneur
docker run -d \
  -p 9000:9000 \
  -e APP_KEY=your-app-key \
  -e DB_HOST=your-db-host \
  -e DB_DATABASE=your-db-name \
  -e DB_USERNAME=your-db-user \
  -e DB_PASSWORD=your-db-password \
  enma-ecommerce:latest
```

### Déploiement sur Render.com

Le projet inclut un fichier `render.yaml` configuré pour Render.com :

1. Connecter votre dépôt GitHub à Render
2. Le fichier `render.yaml` configurera automatiquement :
   - Service web avec Dockerfile
   - Base de données PostgreSQL (gratuite)
   - Variables d'environnement
   - Commandes post-déploiement (migrations)

3. Ajouter les variables d'environnement sensibles via le dashboard Render :
   - `APP_KEY` (générer avec `php artisan key:generate --show`)
   - Clés API PayPal, Orange Money, Wave
   - Configuration email

### Considérations de sécurité en production

- ✅ Définir `APP_DEBUG=false`
- ✅ Utiliser HTTPS (certificat SSL/TLS)
- ✅ Configurer un pare-feu (UFW, iptables)
- ✅ Limiter les accès à la base de données
- ✅ Utiliser des mots de passe forts
- ✅ Activer la protection CSRF (activée par défaut dans Laravel)
- ✅ Configurer les en-têtes de sécurité (HSTS, CSP, etc.)
- ✅ Effectuer des sauvegardes régulières de la base de données

---

## 🔒 Bonnes pratiques & sécurité

### Sécurité

1. **Ne jamais commiter le fichier `.env`** - Il contient des informations sensibles
2. **Régénérer `APP_KEY`** après clonage : `php artisan key:generate`
3. **Utiliser HTTPS en production** pour sécuriser les transactions
4. **Valider toutes les entrées utilisateur** - Les Form Requests sont déjà en place
5. **Mettre à jour régulièrement les dépendances** :
   ```bash
   composer update
   npm update
   ```
6. **Limiter les permissions des fichiers** :
   ```bash
   find . -type f -exec chmod 644 {} \;
   find . -type d -exec chmod 755 {} \;
   chmod -R 775 storage bootstrap/cache
   ```

### Performance

1. **Activer les caches en production** :
   ```bash
   php artisan optimize
   ```

2. **Utiliser un CDN** pour les assets statiques (images, CSS, JS)

3. **Optimiser les images** avec Intervention Image (déjà intégré)

4. **Configurer Redis** pour le cache et les sessions (optionnel mais recommandé) :
   ```dotenv
   CACHE_STORE=redis
   SESSION_DRIVER=redis
   QUEUE_CONNECTION=redis
   ```

### Développement

1. **Respecter les conventions Laravel** (PSR-12, naming conventions)
2. **Écrire des tests** pour les nouvelles fonctionnalités
3. **Utiliser les migrations** pour toute modification de base de données
4. **Documenter les nouvelles API** dans le dossier `docs/`
5. **Utiliser Laravel Pint** pour formater le code :
   ```bash
   ./vendor/bin/pint
   ```

### Recommandations spécifiques

- **Paiements** : Toujours tester en mode sandbox avant production
- **Multi-devise** : Utiliser le `CurrencyHelper` pour formater les montants
- **Notifications** : Configurer correctement le système d'emails pour éviter le spam
- **Backup** : Mettre en place des sauvegardes automatiques de la base de données

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer au projet :

### 1. Fork le projet

Cliquez sur le bouton "Fork" en haut à droite de la page GitHub.

### 2. Créer une branche

```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
```

Conventions de nommage des branches :
- `feature/` pour les nouvelles fonctionnalités
- `bugfix/` pour les corrections de bugs
- `hotfix/` pour les corrections urgentes
- `docs/` pour la documentation

### 3. Commiter les modifications

```bash
git add .
git commit -m "feat: description claire de la fonctionnalité"
```

Conventions de commit (Conventional Commits) :
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` modification de documentation
- `style:` changements de formatage
- `refactor:` refactorisation du code
- `test:` ajout/modification de tests
- `chore:` tâches de maintenance

### 4. Pousser vers la branche

```bash
git push origin feature/ma-nouvelle-fonctionnalite
```

### 5. Ouvrir une Pull Request

Allez sur GitHub et créez une Pull Request avec :
- Un titre clair et descriptif
- Une description détaillée des modifications
- Des captures d'écran si pertinent
- La référence aux issues liées

### Guidelines

- ✅ Écrire des tests pour les nouvelles fonctionnalités
- ✅ Respecter les conventions de code (Laravel Pint)
- ✅ Mettre à jour la documentation si nécessaire
- ✅ S'assurer que tous les tests passent
- ✅ Commiter avec des messages clairs et descriptifs

---

## 📄 Licence

Ce projet est distribué sous licence **MIT**.

> **Note** : Aucun fichier LICENSE n'a été détecté dans le dépôt. Il est recommandé d'ajouter un fichier LICENSE à la racine du projet pour clarifier les termes d'utilisation.

Pour ajouter une licence MIT :

```bash
# Créer le fichier LICENSE à la racine du projet
touch LICENSE
```

Puis y ajouter le contenu de la licence MIT : https://opensource.org/licenses/MIT

---

## 📞 Support et contact

- **Documentation détaillée** : Consultez le dossier [docs/](docs/)
- **Issues** : Pour signaler un bug ou proposer une fonctionnalité, ouvrez une issue sur GitHub
- **Email** : hello@example.com *(à personnaliser)*

---

## 🙏 Remerciements

Projet développé avec :
- [Laravel](https://laravel.com/) - Framework PHP
- [React](https://react.dev/) - Bibliothèque JavaScript
- [Inertia.js](https://inertiajs.com/) - Adaptateur SPA moderne
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Vite](https://vitejs.dev/) - Build tool rapide

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2025

