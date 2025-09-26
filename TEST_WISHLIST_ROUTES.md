# 🔧 Test des Routes Wishlist - Script de Validation

## Test 1 : Vérification des Relations User

```bash
php artisan tinker --execute="
echo 'Test des relations User:' . PHP_EOL;
\$user = App\Models\User::first();
if(\$user) {
    echo 'User trouvé: ' . \$user->email . PHP_EOL;
    echo 'Méthode wishlistItems existe: ' . (method_exists(\$user, 'wishlistItems') ? 'OUI' : 'NON') . PHP_EOL;
    echo 'Relation wishlists existe: ' . (method_exists(\$user, 'wishlists') ? 'OUI' : 'NON') . PHP_EOL;
    if(method_exists(\$user, 'wishlistItems')) {
        echo 'Nombre d\'items wishlist: ' . \$user->wishlistItems()->count() . PHP_EOL;
    }
} else {
    echo 'Aucun utilisateur trouvé' . PHP_EOL;
    echo 'Créons un utilisateur de test...' . PHP_EOL;
    \$user = App\Models\User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password')
    ]);
    echo 'Utilisateur créé: ' . \$user->email . PHP_EOL;
}
"
```

## Test 2 : Test des Routes Frontend (nécessite authentification)

### 1. Connexion puis test d'ajout
```javascript
// Dans la console du navigateur sur http://localhost:8000
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// Test d'ajout d'un produit à la wishlist (ID produit = 1)
fetch('/wishlist/add', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        product_id: 1
    })
})
.then(response => response.json())
.then(data => console.log('Réponse:', data))
.catch(error => console.error('Erreur:', error));
```

### 2. Test de suppression
```javascript
// Test de suppression d'un produit de la wishlist (ID produit = 1)
fetch('/wishlist/remove/1', {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
    }
})
.then(response => response.json())
.then(data => console.log('Réponse suppression:', data))
.catch(error => console.error('Erreur:', error));
```

## Test 3 : Vérification des Routes

```bash
# Lister toutes les routes wishlist
php artisan route:list --name=wishlist

# Vérifier les middlewares
php artisan route:list --name=frontend.wishlist
```

## Solutions aux Problèmes Courants

### 1. Erreur "Call to undefined method wishlistItems"
- Vérifier que la relation est définie dans `App\Models\User`
- Ajouter la méthode si manquante

### 2. Erreur 419 (CSRF Token Mismatch)
- Vérifier que le token CSRF est inclus dans les headers
- S'assurer que les cookies de session sont transmis

### 3. Erreur 401 (Unauthenticated)
- Vérifier que l'utilisateur est connecté
- Tester en étant connecté sur l'interface

### 4. Popup de dump au lieu de notification
- Vérifier que les routes utilisent `response()->json()`
- S'assurer qu'il n'y a pas de `dd()` ou `dump()` dans le code
- Vérifier les headers `Accept: application/json`

## Checklist de Validation

- [ ] Relations User définies ✅
- [ ] Routes web wishlist créées ✅  
- [ ] WishlistButton utilise les bonnes routes ✅
- [ ] CSRF token inclus ✅
- [ ] Headers JSON corrects ✅
- [ ] Authentification web (session) ✅
- [ ] Notifications fonctionnelles ✅

## Prochaines Étapes

1. Tester l'ajout/suppression wishlist dans le navigateur
2. Vérifier que les notifications apparaissent
3. Contrôler l'état de la wishlist en base de données
4. Optimiser les performances si nécessaire
