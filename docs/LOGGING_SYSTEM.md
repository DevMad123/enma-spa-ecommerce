# Système de Logs Centralisé

## 📋 Vue d'ensemble

Un système complet de logging centralisé a été mis en place pour suivre tous les événements importants de l'application.

## ✨ Fonctionnalités

- ✅ Service de logging centralisé (`LogService`)
- ✅ Canaux de logs séparés par type (commandes, paiements, système, erreurs, utilisateurs)
- ✅ Commande Artisan pour consulter les logs
- ✅ Filtrage par niveau, date et recherche
- ✅ Suivi en temps réel
- ✅ Rotation automatique des logs
- ✅ Format JSON structuré avec contexte enrichi

## 🗂️ Canaux de Logs Disponibles

| Canal | Fichier | Conservation | Description |
|-------|---------|--------------|-------------|
| **orders** | `storage/logs/orders-YYYY-MM-DD.log` | 30 jours | Événements liés aux commandes |
| **payments** | `storage/logs/payments-YYYY-MM-DD.log` | 90 jours | Transactions et paiements |
| **system** | `storage/logs/system-YYYY-MM-DD.log` | 60 jours | Backups, migrations, maintenance |
| **errors** | `storage/logs/errors-YYYY-MM-DD.log` | 90 jours | Erreurs et exceptions |
| **users** | `storage/logs/users-YYYY-MM-DD.log` | 60 jours | Connexions, inscriptions |
| **performance** | `storage/logs/performance-YYYY-MM-DD.log` | 7 jours | Métriques de performance |

## 🚀 Utilisation du LogService

### Logs de Commandes

```php
use App\Services\LogService;

// Commande créée
LogService::order()->created($order);

// Commande mise à jour
LogService::order()->updated($order, $oldStatus);

// Changement de statut
LogService::order()->statusChanged($order, 'pending', 'processing');

// Commande annulée
LogService::order()->cancelled($order, 'Demande client');

// Commande livrée
LogService::order()->delivered($order);

// Email envoyé
LogService::order()->emailSent($order);

// Échec
LogService::order()->failed($orderId, 'Stock insuffisant');
```

### Logs de Paiements

```php
// Paiement initié
LogService::payment()->initiated($orderId, 'paypal', 150.00);

// Paiement réussi
LogService::payment()->success($orderId, 'TXN-123', 'paypal', 150.00);

// Paiement échoué
LogService::payment()->failed($orderId, 'orange_money', 150.00, 'Solde insuffisant');

// Remboursement
LogService::payment()->refunded($orderId, 'TXN-123', 150.00);

// Webhook reçu
LogService::payment()->webhookReceived('paypal', 'payment.completed', [
    'transaction_id' => 'TXN-123',
    'amount' => 150.00,
]);
```

### Logs Système

```php
// Backup
LogService::system()->backup('success', [
    'filename' => 'backup.sql.gz',
    'size' => '21 KB',
]);

// Migration
LogService::system()->migration('completed', ['count' => 5]);

// Tâche planifiée
LogService::system()->scheduled('db:backup', 'success');

// Configuration modifiée
LogService::system()->configChanged('app.timezone', 'UTC', 'Africa/Dakar');

// Cache nettoyé
LogService::system()->cacheCleared('config');

// Démarrage application
LogService::system()->startup(app()->environment());
```

### Logs d'Erreurs

```php
// Exception
try {
    // code...
} catch (\Exception $e) {
    LogService::error()->exception($e, [
        'context' => 'Payment processing',
        'order_id' => $orderId,
    ]);
}

// Erreur de base de données
LogService::error()->database($query, $error);

// Erreur de validation
LogService::error()->validation($validator->errors(), $request->all());

// Erreur d'authentification
LogService::error()->authentication('invalid_credentials', ['email' => $email]);

// Ressource non trouvée
LogService::error()->notFound('Order', $orderId);
```

### Logs Utilisateurs

```php
// Inscription
LogService::user()->registered($user);

// Connexion
LogService::user()->login($user);

// Déconnexion
LogService::user()->logout($user);

// Échec de connexion
LogService::user()->loginFailed($email, 'Invalid credentials');

// Changement de mot de passe
LogService::user()->passwordChanged($user);

// Suppression
LogService::user()->deleted($userId, $email);
```

### Logs d'Inventaire

```php
// Stock mis à jour
LogService::inventory()->stockUpdated($product, 50, 45);

// Stock faible
LogService::inventory()->lowStock($product, 5, 10);

// Rupture de stock
LogService::inventory()->outOfStock($product);

// Prix modifié
LogService::inventory()->priceChanged($product, 100.00, 120.00);
```

## 🔍 Consultation des Logs

### Commande de Base

```bash
php artisan logs:view {canal}
```

Exemples :
```bash
php artisan logs:view orders
php artisan logs:view payments
php artisan logs:view system
php artisan logs:view errors
php artisan logs:view users
```

### Options Disponibles

#### Afficher plus de lignes

```bash
php artisan logs:view orders --lines=100
```

#### Filtrer par niveau

```bash
php artisan logs:view errors --level=error
php artisan logs:view users --level=warning
```

Niveaux disponibles : `debug`, `info`, `warning`, `error`, `critical`

#### Rechercher un terme

```bash
php artisan logs:view payments --search="paypal"
php artisan logs:view orders --search="cancelled"
```

#### Logs d'aujourd'hui uniquement

```bash
php artisan logs:view orders --today
```

#### Suivi en temps réel

```bash
php artisan logs:view orders --follow
```

Appuyez sur `Ctrl+C` pour arrêter.

#### Combinaisons

```bash
# Erreurs de paiement d'aujourd'hui
php artisan logs:view payments --today --level=error

# Recherche dans les logs système
php artisan logs:view system --search="backup" --lines=20

# Suivre les erreurs en temps réel
php artisan logs:view errors --follow --level=error
```

### Lister tous les fichiers de logs

```bash
php artisan logs:view
```

Sans canal spécifié, la commande affichera tous les fichiers disponibles.

## 📊 Exemples d'Intégration

### Dans un Controller

```php
<?php

namespace App\Http\Controllers;

use App\Models\Sell;
use App\Services\LogService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        try {
            $order = Sell::create($request->validated());
            
            // Logger la création
            LogService::order()->created($order);
            
            return response()->json($order, 201);
            
        } catch (\Exception $e) {
            // Logger l'erreur
            LogService::error()->exception($e, [
                'action' => 'store_order',
                'input' => $request->all(),
            ]);
            
            return response()->json(['error' => 'Failed to create order'], 500);
        }
    }
    
    public function updateStatus(Request $request, $id)
    {
        $order = Sell::findOrFail($id);
        $oldStatus = $order->status;
        
        $order->update(['status' => $request->status]);
        
        // Logger le changement
        LogService::order()->statusChanged($order, $oldStatus, $request->status);
        
        return response()->json($order);
    }
}
```

### Dans un Service de Paiement

```php
<?php

namespace App\Services;

class PaymentService
{
    public function processPayment($orderId, $amount, $method)
    {
        // Logger l'initiation
        LogService::payment()->initiated($orderId, $method, $amount);
        
        try {
            $result = $this->gateway->charge($amount, $method);
            
            if ($result->success) {
                // Logger le succès
                LogService::payment()->success(
                    $orderId,
                    $result->transactionId,
                    $method,
                    $amount
                );
                
                return ['success' => true];
            }
            
        } catch (\Exception $e) {
            // Logger l'échec
            LogService::payment()->failed($orderId, $method, $amount, $e->getMessage());
            LogService::error()->exception($e);
            
            throw $e;
        }
    }
}
```

### Dans un Observer

```php
<?php

namespace App\Observers;

use App\Models\Product;
use App\Services\LogService;

class ProductObserver
{
    public function updated(Product $product)
    {
        if ($product->isDirty('available_quantity')) {
            $oldStock = $product->getOriginal('available_quantity');
            $newStock = $product->available_quantity;
            
            LogService::inventory()->stockUpdated($product, $oldStock, $newStock);
            
            // Alertes
            if ($newStock <= 10 && $newStock > 0) {
                LogService::inventory()->lowStock($product, $newStock, 10);
            }
            
            if ($newStock == 0) {
                LogService::inventory()->outOfStock($product);
            }
        }
        
        if ($product->isDirty('current_sale_price')) {
            $oldPrice = $product->getOriginal('current_sale_price');
            $newPrice = $product->current_sale_price;
            
            LogService::inventory()->priceChanged($product, $oldPrice, $newPrice);
        }
    }
}
```

### Dans un Middleware

```php
<?php

namespace App\Http\Middleware;

use App\Services\LogService;
use Closure;

class LogAuthentication
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);
        
        if ($request->user()) {
            // Utilisateur authentifié
        } else if ($request->is('api/login') && $request->isMethod('post')) {
            // Échec de connexion potentiel
            if ($response->status() === 401) {
                LogService::user()->loginFailed(
                    $request->input('email'),
                    'Invalid credentials'
                );
            }
        }
        
        return $response;
    }
}
```

## 📈 Format des Logs

Chaque entrée de log contient :

```json
{
  "timestamp": "2025-12-26 15:10:16",
  "level": "INFO",
  "channel": "PAYMENT",
  "message": "✅ Paiement réussi pour commande #123",
  "context": {
    "user_id": 42,
    "ip": "192.168.1.1",
    "order_id": 123,
    "transaction_id": "TXN-123",
    "method": "paypal",
    "amount": 150.00
  }
}
```

## 🔧 Configuration

### Modifier la Durée de Conservation

Éditez `config/logging.php` :

```php
'orders' => [
    'driver' => 'daily',
    'path' => storage_path('logs/orders.log'),
    'level' => env('LOG_LEVEL', 'debug'),
    'days' => 30, // Modifier ici
],
```

### Changer le Niveau de Log

Dans `.env` :

```env
LOG_LEVEL=debug    # Pour tout logger
LOG_LEVEL=info     # Normal
LOG_LEVEL=warning  # Seulement warnings et erreurs
LOG_LEVEL=error    # Seulement erreurs
```

## 📦 Bonnes Pratiques

1. **Logger les Événements Importants** : Commandes, paiements, modifications critiques

2. **Contextualiser** : Toujours inclure le contexte pertinent (IDs, montants, etc.)

3. **Utiliser le Bon Canal** : Ne pas mélanger les types d'événements

4. **Ne Pas Logger les Données Sensibles** : Mots de passe, tokens, données bancaires complètes

5. **Nettoyer Régulièrement** : Les logs anciens sont automatiquement supprimés

6. **Surveiller les Erreurs** : Consultez régulièrement le canal `errors`

7. **Performance** : Les logs sont asynchrones et n'impactent pas les performances

## 🔐 Sécurité

⚠️ **Attention** : Les logs peuvent contenir des informations sensibles !

- Protégez l'accès au dossier `storage/logs/`
- Ne commitez jamais les logs dans Git (déjà dans `.gitignore`)
- Limitez l'accès SSH aux logs en production
- Nettoyez régulièrement les logs en production

## 📊 Monitoring en Production

### Surveiller les Erreurs

```bash
# Logs d'erreurs du jour
php artisan logs:view errors --today

# Suivre les erreurs en temps réel
php artisan logs:view errors --follow --level=error
```

### Surveiller les Paiements

```bash
# Paiements échoués
php artisan logs:view payments --today --level=error

# Tous les paiements du jour
php artisan logs:view payments --today
```

### Surveiller les Backups

```bash
# Statut des backups
php artisan logs:view system --search="backup"
```

## 🆘 Dépannage

### Les logs ne sont pas créés

1. Vérifiez les permissions : `chmod -R 775 storage/logs`
2. Vérifiez la configuration dans `config/logging.php`
3. Nettoyez le cache : `php artisan config:clear`

### Fichier de log trop volumineux

1. Réduisez la durée de conservation dans `config/logging.php`
2. Changez le niveau de log : `LOG_LEVEL=warning` dans `.env`
3. Nettoyez manuellement : `rm storage/logs/*.log`

### Impossible de lire les logs

1. Vérifiez les permissions : `chmod 644 storage/logs/*.log`
2. Utilisez la commande Artisan plutôt que `cat` ou `tail`

---

**Date de création** : 26 décembre 2025  
**Dernière mise à jour** : 26 décembre 2025
