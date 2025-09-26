# Système de Gestion des Messages de Contact et Newsletter

## Vue d'ensemble

Ce système complet de gestion des messages de contact et des abonnements newsletter a été implémenté pour l'application e-commerce Laravel 11 + React (Inertia.js).

## Fonctionnalités implémentées

### 1. Messages de Contact

#### Backend (Laravel)
- **Migration** : `create_contact_messages_table`
  - Colonnes : id, name, email, subject, message, status, timestamps
  - Status enum : 'new', 'in_progress', 'resolved'
  - Index sur status et created_at pour les performances

- **Modèle** : `App\Models\ContactMessage`
  - Constantes de statut
  - Scopes : new(), inProgress(), resolved(), recent()
  - Méthode getStatuses() pour l'interface
  - Attributs formatés

- **FormRequest** : `App\Http\Requests\StoreContactMessageRequest`
  - Validation complète avec messages en français
  - Règles : name (requis, string, max:255), email (requis, email), subject (requis, string, max:255), message (requis, string, max:5000)

- **Contrôleurs** :
  - `Frontend\ContactController` : Gestion du formulaire public
  - `Admin\ContactMessageController` : Interface d'administration complète
    - index() : Liste avec pagination, filtres et statistiques
    - show() : Détail d'un message
    - update() : Changement de statut
    - destroy() : Suppression
    - bulkAction() : Actions en lot (suppression, changement de statut)

#### Frontend (React)
- **Page Admin Index** : `resources/js/Pages/Admin/ContactMessages/Index.jsx`
  - Interface complète avec statistiques
  - Filtres par statut et recherche textuelle
  - Sélection multiple et actions en lot
  - Pagination
  - Changement de statut en ligne

- **Page Admin Show** : `resources/js/Pages/Admin/ContactMessages/Show.jsx`
  - Détail complet du message
  - Actions rapides (répondre par email, changer statut, supprimer)
  - Informations techniques

### 2. Newsletter

#### Backend (Laravel)
- **Migration** : `create_newsletters_table`
  - Colonnes : id, email (unique), subscribed_at, timestamps
  - Contrainte unique sur l'email

- **Modèle** : `App\Models\Newsletter`
  - Scopes temporels : recent(), today(), thisWeek(), thisMonth()
  - Méthodes statistiques : getTotalSubscribers(), getRecentSubscribers(), getGrowthRate()

- **FormRequest** : `App\Http\Requests\StoreNewsletterRequest`
  - Validation email avec contrainte unique
  - Messages d'erreur en français

- **Contrôleurs** :
  - `Frontend\NewsletterController` : API publique
    - subscribe() : Inscription
    - unsubscribe() : Désinscription
    - checkSubscription() : Vérification statut
  - `Admin\NewsletterController` : Interface d'administration
    - index() : Liste avec statistiques et graphique d'évolution
    - destroy() : Suppression individuelle
    - bulkDelete() : Suppression en lot
    - export() : Export CSV
    - statistics() : API pour statistiques dashboard

#### Frontend (React)
- **Composants réutilisables** :
  - `NewsletterForm.jsx` : Formulaire d'inscription
  - `NewsletterSection.jsx` : Section complète avec fonctionnalités

- **Page Admin** : `resources/js/Pages/Admin/Newsletters/Index.jsx`
  - Statistiques détaillées (total, aujourd'hui, semaine, mois)
  - Graphique d'évolution sur 7 jours
  - Filtres par période et recherche par email
  - Export CSV avec filtres appliqués
  - Suppression individuelle et en lot

### 3. Routes

#### Routes publiques
```php
// Messages de contact
GET  /contact                    - Formulaire de contact
POST /contact                    - Envoi de message

// Newsletter
POST /newsletter/subscribe       - Inscription
POST /newsletter/unsubscribe     - Désinscription
POST /newsletter/check          - Vérification statut
```

#### Routes admin (protégées)
```php
// Messages de contact
GET    /admin/contact-messages           - Liste
GET    /admin/contact-messages/{id}      - Détail
PUT    /admin/contact-messages/{id}      - Mise à jour statut
DELETE /admin/contact-messages/{id}      - Suppression
POST   /admin/contact-messages/bulk-action - Actions en lot

// Newsletter
GET    /admin/newsletters                - Liste
DELETE /admin/newsletters/{id}           - Suppression
POST   /admin/newsletters/bulk-delete    - Suppression en lot
GET    /admin/newsletters/export         - Export CSV
GET    /admin/newsletters/statistics     - Statistiques API
```

### 4. Navigation Admin

Nouvelle section "Communication" ajoutée au menu AdminLayout :
- Messages de Contact
- Newsletter

## Données de test

Un seeder `ContactMessageSeeder` a été créé avec :
- 5 messages de contact avec différents statuts
- 7 abonnements newsletter répartis sur différentes périodes

## Utilisation

### Pour les développeurs

1. **Exécuter les migrations** :
   ```bash
   php artisan migrate
   ```

2. **Générer des données de test** :
   ```bash
   php artisan db:seed --class=ContactMessageSeeder
   ```

3. **Accéder à l'interface admin** :
   - Messages de contact : `/admin/contact-messages`
   - Newsletter : `/admin/newsletters`

### Pour les utilisateurs

1. **Formulaire de contact** :
   - Utiliser le formulaire existant sur `/contact`
   - Les messages sont automatiquement stockés en base

2. **Inscription newsletter** :
   - Utiliser le composant `NewsletterForm` ou `NewsletterSection`
   - Intégrer dans le footer ou autres sections du site

## Sécurité

- Validation stricte des données d'entrée
- Protection CSRF sur toutes les routes POST/PUT/DELETE
- Contraintes de base de données (unique email pour newsletter)
- Authentification requise pour l'interface admin

## Performance

- Index sur les colonnes de recherche fréquente
- Pagination sur les listes longues
- Scopes optimisés pour les requêtes statistiques

## Extensibilité

Le système est conçu pour être facilement extensible :
- Ajout de nouveaux statuts pour les messages
- Intégration avec des services d'emailing
- Système de templates pour les réponses automatiques
- Notifications en temps réel