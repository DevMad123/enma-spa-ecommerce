# Système d'Accès Admin - Documentation

## 📋 Vue d'ensemble

Le système d'accès admin utilise un **système de rôles** flexible au lieu d'une simple colonne `is_admin`. Cela permet une gestion fine des permissions et des rôles multiples.

## 🔐 Architecture

### Modèles

- **User** : Utilisateur de l'application
- **Role** : Rôle (Admin, Manager, Staff, Customer)
- **Permission** : Permission spécifique (structure prête, non implémentée)
- **Table pivot `user_role`** : Relation many-to-many entre users et roles

### Rôles disponibles

```
Admin     → Accès complet à l'administration
Manager   → Accès complet à l'administration (équivalent Admin)
Staff     → Personnel (actuellement même accès que Customer)
Customer  → Client standard (pas d'accès admin)
```

## 🛠️ Implémentation

### 1. Middleware `IsAdmin`

**Fichier** : `app/Http/Middleware/IsAdmin.php`

```php
public function handle(Request $request, Closure $next): Response
{
    // Vérifie si l'utilisateur a le rôle Admin
    if (auth()->check() && auth()->user()->hasRole('Admin')) {
        return $next($request);
    }

    abort(403, 'Accès refusé : Vous devez être administrateur.');
}
```

**Enregistrement** : `bootstrap/app.php`
```php
'isAdmin' => IsAdmin::class,
```

### 2. Accessor `is_admin` dans User

**Fichier** : `app/Models/User.php`

```php
public function getIsAdminAttribute()
{
    return $this->hasRole('Admin') || $this->hasRole('Manager');
}
```

**Usage** :
```php
if ($user->is_admin) {
    // L'utilisateur est admin ou manager
}
```

### 3. Méthodes de vérification de rôles

**Dans le modèle User** :

```php
// Vérifier un rôle
$user->hasRole('Admin'); // true/false

// Vérifier une permission (si implémentée)
$user->hasPermission('edit-products'); // true/false

// Assigner un rôle
$user->assignRole('Admin');

// Retirer un rôle
$user->removeRole('Admin');

// Obtenir tous les rôles
$user->roles; // Collection de Role
```

### 4. Protection des routes

**Fichier** : `routes/web.php`

```php
// Toutes les routes admin sont protégées
Route::middleware(['auth', 'verified', 'isAdmin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // Routes admin...
    });
```

## 👥 Comptes par défaut

**Créés par les seeders** :

### Admin (Accès total)
- **Email** : `admin@enma-shop.com`
- **Mot de passe** : `Admin@Enma2025!`
- **Rôles** : Admin + Manager
- **Accès** : ✓ Interface admin complète

### Utilisateur standard
- **Email** : `john@example.com`
- **Mot de passe** : `User@Demo2025!`
- **Rôles** : Staff + Customer
- **Accès** : ✗ Pas d'accès admin

⚠️ **IMPORTANT** : Changez ces mots de passe lors du premier déploiement en production !

## 🧪 Tests

### Test manuel

```bash
php test_admin_access.php
```

### Test dans l'application

1. Créez un utilisateur sans rôle Admin
2. Tentez d'accéder à `/admin`
3. Vous devriez voir une erreur 403

## 🔧 Commandes utiles

### Assigner le rôle Admin à un utilisateur

```bash
php artisan tinker
```

```php
$user = User::where('email', 'user@example.com')->first();
$user->assignRole('Admin');
```

### Vérifier les rôles d'un utilisateur

```php
$user = User::where('email', 'admin@enma-shop.com')->first();
$user->roles->pluck('name'); // ['Admin', 'Manager']
```

### Créer un nouvel admin

```php
$user = User::create([
    'name' => 'Nouvel Admin',
    'email' => 'new-admin@example.com',
    'password' => bcrypt('mot-de-passe-fort'),
    'email_verified_at' => now(),
]);

$user->assignRole('Admin');
```

## 📊 Scopes disponibles

```php
// Filtrer les admins
User::withRole('Admin')->get();

// Utilisateurs actifs
User::active()->get();

// Utilisateurs inactifs
User::inactive()->get();
```

## 🚀 Bonnes pratiques

### 1. Ne jamais hardcoder les rôles

❌ **Mauvais** :
```php
if ($user->id === 1) {
    // admin
}
```

✅ **Bon** :
```php
if ($user->hasRole('Admin')) {
    // admin
}
```

### 2. Utiliser les middlewares

❌ **Mauvais** :
```php
public function index()
{
    if (!auth()->user()->hasRole('Admin')) {
        abort(403);
    }
    // ...
}
```

✅ **Bon** :
```php
// Dans routes/web.php
Route::middleware('isAdmin')->group(function () {
    Route::get('/admin', [AdminController::class, 'index']);
});
```

### 3. Vérifier l'authentification d'abord

```php
if (auth()->check() && auth()->user()->hasRole('Admin')) {
    // Sûr
}
```

## 🔮 Évolutions futures

### Permissions granulaires

Le système de permissions est prêt mais non implémenté :

```php
// Table permissions existe
// Table role_permission existe
// Méthodes hasPermission() et assignPermission() existent

// Usage futur :
if ($user->hasPermission('edit-products')) {
    // Autoriser l'édition
}
```

### Rôles personnalisés

Vous pouvez créer de nouveaux rôles :

```php
Role::create([
    'name' => 'Editor',
    'description' => 'Peut éditer le contenu',
    'status' => 1,
]);
```

### Middleware par rôle

Créez des middlewares pour chaque rôle :

```php
// app/Http/Middleware/HasRole.php
if (!auth()->user()->hasRole($role)) {
    abort(403);
}
```

## 📝 Résumé

✅ Système de rôles flexible  
✅ Middleware `isAdmin` fonctionnel  
✅ Méthodes de vérification dans User  
✅ Routes admin protégées  
✅ Seeders configurés  
✅ Tests disponibles  
✅ Structure permissions prête  

## 🆘 Dépannage

### Utilisateur ne peut pas accéder à l'admin

1. Vérifier les rôles :
```bash
php artisan tinker
User::find(1)->roles->pluck('name');
```

2. Assigner le rôle :
```php
User::find(1)->assignRole('Admin');
```

3. Nettoyer le cache :
```bash
php artisan optimize:clear
```

### Erreur 403 même avec le bon rôle

1. Vérifier que le middleware est enregistré :
```php
// bootstrap/app.php
'isAdmin' => IsAdmin::class,
```

2. Vérifier la relation user_role :
```sql
SELECT * FROM user_role WHERE user_id = 1;
```

3. Relancer les seeders :
```bash
php artisan db:seed --class=UserRoleSeeder
```

---

**Dernière mise à jour** : 26 décembre 2025  
**Version** : 1.0.0
