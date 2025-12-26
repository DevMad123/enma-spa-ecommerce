# 🚨 Gestion des Erreurs - ENMA E-Commerce

Documentation complète sur la gestion des erreurs 404, 403, 500 et autres dans l'application.

---

## 📋 Vue d'ensemble

L'application utilise **Inertia.js avec React** pour gérer les erreurs. Contrairement aux applications Laravel traditionnelles, les erreurs sont gérées côté React pour une expérience utilisateur cohérente.

---

## 🎯 Comment ça fonctionne

### 1. **Page Error.jsx**

**Fichier** : `resources/js/Pages/Error.jsx`

Cette page unique gère **tous les codes d'erreur** (404, 403, 500, 503, etc.).

```jsx
// Inertia détecte automatiquement les erreurs et rend cette page
export default function NotFound({ status = 404 }) {
    // Le prop "status" contient le code d'erreur HTTP
}
```

### 2. **Détection automatique**

Quand Laravel retourne une erreur :
- ✅ **404** : Route non trouvée
- ✅ **403** : Accès refusé (middleware)
- ✅ **500** : Erreur serveur
- ✅ **503** : Maintenance mode

→ Inertia rend automatiquement `Error.jsx` avec le code d'erreur.

### 3. **Configuration Inertia**

**Fichier** : `app/Http/Middleware/HandleInertiaRequests.php`

```php
protected $rootView = 'app'; // Vue de base
```

Le middleware Inertia intercepte les erreurs et charge la page Error.jsx.

---

## 🎨 Page d'Erreur Actuelle

### Fonctionnalités

✅ **Design moderne et responsive**
- Grande illustration du code d'erreur (404, 403, etc.)
- Icône animée au centre
- Gradient de fond élégant

✅ **Messages personnalisés par code**
- 404 : "Page non trouvée"
- 403 : "Accès refusé"
- 500 : "Erreur serveur"
- 503 : "Service temporairement indisponible"

✅ **Actions rapides**
- Bouton "Retour à l'accueil"
- Bouton "Voir la boutique"
- Bouton "Retour" (historique navigateur)

✅ **Suggestions (404 uniquement)**
- Liens vers : Boutique, Contact, À propos, FAQ

✅ **Lien de support**
- Lien vers la page de contact

---

## 🔧 Types d'Erreurs Gérées

### 1. Erreur 404 - Page Non Trouvée

**Causes** :
- URL inexistante (ex: `/page-qui-nexiste-pas`)
- Produit supprimé (ex: `/shop/product/999`)
- Route mal orthographiée

**Exemple** :
```javascript
// URL invalide
http://localhost:8000/produit-inexistant
```

**Rendu** : Page Error.jsx avec status=404

### 2. Erreur 403 - Accès Refusé

**Causes** :
- Utilisateur non autorisé (middleware `isAdmin`)
- Tentative d'accès à `/admin` sans rôle Admin
- Permission insuffisante

**Exemple** :
```php
// routes/web.php
Route::middleware(['auth', 'isAdmin'])->group(function () {
    // Un utilisateur sans rôle Admin verra une 403
});
```

**Rendu** : Page Error.jsx avec status=403

### 3. Erreur 500 - Erreur Serveur

**Causes** :
- Exception non gérée dans le code
- Erreur de base de données
- Problème de configuration

**Exemple** :
```php
// Exception dans un contrôleur
public function show($id) {
    $product = Product::findOrFail($id); // Exception si non trouvé
}
```

**Rendu** : Page Error.jsx avec status=500

### 4. Erreur 503 - Maintenance

**Causes** :
- Mode maintenance activé : `php artisan down`

**Commandes** :
```bash
# Activer le mode maintenance
php artisan down --message="Mise à jour en cours"

# Désactiver
php artisan up
```

**Rendu** : Page Error.jsx avec status=503

---

## 🛠️ Personnalisation

### Modifier les messages

**Fichier** : `resources/js/Pages/Error.jsx`

```jsx
const messages = {
    404: 'Page non trouvée',
    403: 'Accès refusé',
    500: 'Erreur serveur',
    503: 'Service temporairement indisponible',
    // Ajouter d'autres codes
};

const descriptions = {
    404: 'Désolé, la page que vous recherchez n\'existe pas...',
    // Personnaliser les descriptions
};
```

### Ajouter des codes d'erreur

```jsx
const messages = {
    ...messages,
    401: 'Non authentifié',
    429: 'Trop de requêtes',
};
```

### Changer le design

Modifiez les classes Tailwind CSS dans `Error.jsx` :

```jsx
// Changer la couleur du bouton principal
<Link
    href="/"
    className="bg-indigo-600 hover:bg-indigo-700"
    // Changer en :
    className="bg-blue-600 hover:bg-blue-700"
>
```

### Ajouter des actions personnalisées

```jsx
// Ajouter un bouton "Signaler"
<Link
    href="/report-issue"
    className="px-6 py-3 bg-red-600 text-white rounded-lg"
>
    Signaler le problème
</Link>
```

---

## 📝 Configuration Laravel

### Handler d'exceptions (Laravel 11)

**Fichier** : `bootstrap/app.php`

Par défaut, Laravel 11 gère automatiquement les erreurs. Pour personnaliser :

```php
use Illuminate\Foundation\Application;

return Application::configure(basePath: dirname(__DIR__))
    ->withExceptions(function($exceptions) {
        // Personnalisation des exceptions
    })
    ->create();
```

### Désactiver les pages d'erreur Laravel

Avec Inertia, les pages d'erreur Laravel Blade ne sont **pas utilisées**.

❌ `resources/views/errors/404.blade.php` → Non utilisé
✅ `resources/js/Pages/Error.jsx` → Utilisé

---

## 🧪 Tester les Pages d'Erreur

### 1. Test 404

```bash
# Accéder à une URL invalide
http://localhost:8000/page-inexistante
```

### 2. Test 403

```bash
# Se connecter avec un utilisateur sans rôle Admin
# Puis accéder à :
http://localhost:8000/admin
```

### 3. Test 500

Créer une erreur temporaire dans un contrôleur :

```php
// app/Http/Controllers/HomeController.php
public function index() {
    throw new \Exception('Test erreur 500');
}
```

### 4. Test 503

```bash
php artisan down
# Accéder à n'importe quelle page
php artisan up
```

### 5. Test via Tinker

```bash
php artisan tinker
```

```php
abort(404);
abort(403, 'Accès refusé personnalisé');
abort(500, 'Erreur serveur');
```

---

## 🚀 Bonnes Pratiques

### 1. **Utiliser les exceptions Laravel**

```php
// Au lieu de vérifier manuellement
if (!$product) {
    abort(404);
}

// Utiliser findOrFail (lance automatiquement 404)
$product = Product::findOrFail($id);
```

### 2. **Gestion des erreurs API**

Pour les routes API, retourner du JSON :

```php
// routes/api.php
Route::get('/products/{id}', function ($id) {
    $product = Product::find($id);
    
    if (!$product) {
        return response()->json([
            'error' => 'Product not found'
        ], 404);
    }
    
    return $product;
});
```

### 3. **Logs d'erreurs**

Les erreurs sont automatiquement loggées :

```bash
# Voir les logs
tail -f storage/logs/laravel.log
```

### 4. **Mode Debug**

En développement : `APP_DEBUG=true` dans `.env`
- Affiche les traces d'erreur détaillées
- Ne JAMAIS activer en production

En production : `APP_DEBUG=false`
- Affiche uniquement la page d'erreur
- Logs les détails en arrière-plan

---

## 🔒 Sécurité

### Ne pas exposer d'informations sensibles

❌ **Mauvais** :
```jsx
<p>Erreur SQL : {error.message}</p>
```

✅ **Bon** :
```jsx
<p>Une erreur est survenue. Veuillez réessayer.</p>
```

### Différencier dev et prod

```jsx
// Afficher les détails seulement en développement
{import.meta.env.DEV && (
    <pre>{JSON.stringify(error, null, 2)}</pre>
)}
```

---

## 📊 Monitoring des Erreurs

### 1. **Logs Laravel**

```bash
tail -f storage/logs/laravel.log
```

### 2. **Sentry (Recommandé pour production)**

```bash
composer require sentry/sentry-laravel
php artisan sentry:publish --dsn=https://xxx@sentry.io/xxx
```

Sentry capture automatiquement toutes les erreurs et envoie des notifications.

### 3. **Google Analytics (Optionnel)**

Tracker les erreurs 404 :

```jsx
// Error.jsx
useEffect(() => {
    if (window.gtag && status === 404) {
        gtag('event', 'page_not_found', {
            page_path: window.location.pathname
        });
    }
}, [status]);
```

---

## 🎨 Pages d'Erreur Alternatives

### Page 404 Simple

Créer `resources/js/Pages/Errors/NotFound.jsx` :

```jsx
export default function NotFound() {
    return (
        <div className="text-center py-20">
            <h1 className="text-6xl">404</h1>
            <p>Page non trouvée</p>
            <Link href="/">Accueil</Link>
        </div>
    );
}
```

### Page de Maintenance Personnalisée

Créer `resources/views/errors/503.blade.php` :

```blade
<!DOCTYPE html>
<html>
<head>
    <title>Maintenance</title>
</head>
<body>
    <h1>Site en maintenance</h1>
    <p>Nous revenons bientôt !</p>
</body>
</html>
```

---

## 🆘 Dépannage

### Erreur non capturée par Error.jsx

**Cause** : Exception avant le rendu Inertia

**Solution** : Vérifier `storage/logs/laravel.log`

### Page blanche au lieu d'Error.jsx

**Cause** : Erreur dans Error.jsx lui-même

**Solution** :
```bash
npm run build
php artisan optimize:clear
```

### 404 ne s'affiche pas

**Cause** : Route fallback manquante

**Solution** : Vérifier que `routes/web.php` n'a pas de route `catch-all` qui interfère.

---

## ✅ Résumé

| Code | Type | Page affichée | Gestion |
|------|------|---------------|---------|
| 404  | Not Found | Error.jsx | Automatique |
| 403  | Forbidden | Error.jsx | Automatique |
| 500  | Server Error | Error.jsx | Automatique |
| 503  | Maintenance | 503.blade.php ou Error.jsx | php artisan down |

---

**Dernière mise à jour** : 26 décembre 2025  
**Version** : 1.0.0
