# 🧪 Guide de Test des Paiements

## 📋 Vue d'ensemble

Ce guide vous aide à tester les 3 systèmes de paiement intégrés :
- **PayPal** (cartes bancaires + compte PayPal)
- **Orange Money** (Mobile Money Afrique de l'Ouest)
- **Wave** (Mobile Money Côte d'Ivoire)

---

## ✅ Prérequis

### 1. Serveurs actifs
```bash
# Terminal 1
php artisan serve

# Terminal 2  
npm run dev
```

### 2. Compte utilisateur connecté
```
Email: john@example.com
Mot de passe: User@Demo2025!
```

### 3. Configuration .env

Vérifiez que votre `.env` contient :

```env
# PayPal
PAYPAL_MODE=sandbox
PAYPAL_SANDBOX_CLIENT_ID=votre_client_id
PAYPAL_SANDBOX_CLIENT_SECRET=votre_secret
PAYPAL_CURRENCY=XOF

# Orange Money
ORANGE_MONEY_MODE=sandbox
ORANGE_MONEY_SANDBOX_CLIENT_ID=votre_client_id
ORANGE_MONEY_SANDBOX_CLIENT_SECRET=votre_secret
ORANGE_MONEY_CURRENCY=XOF

# Wave
WAVE_MODE=sandbox
WAVE_SANDBOX_API_KEY=votre_api_key
WAVE_SANDBOX_SECRET_KEY=votre_secret
WAVE_CURRENCY=XOF
```

---

## 🧪 Test 1 : PayPal Sandbox

### Étape 1 : Préparer le panier
1. Accédez à http://localhost:8000/shop
2. Ajoutez 2-3 produits au panier
3. Cliquez sur "Panier" → "Commander"

### Étape 2 : Remplir les informations
```
Nom: Test PayPal
Email: john@example.com
Téléphone: +225 07 77 12 45 67
Adresse: 123 Rue Test
Ville: Abidjan
Code postal: 12000
Pays: Côte d'Ivoire
```

### Étape 3 : Sélectionner PayPal
- Cochez **"PayPal"** dans les méthodes de paiement
- Cliquez sur **"Passer la commande"**

### Étape 4 : Paiement Sandbox PayPal

Vous serez redirigé vers PayPal Sandbox. Utilisez un compte de test :

**Compte Acheteur Sandbox** :
```
Email: sb-buyer@business.example.com
Mot de passe: (fourni par PayPal Sandbox)
```

OU utilisez une **carte de test** :
```
Numéro: 4032 0384 2516 9923
Expiration: 12/2028
CVV: 123
```

### Étape 5 : Validation
✅ Après paiement, vous devriez :
- Être redirigé vers `/paypal/callback/success/{order_id}`
- Voir la page "Paiement réussi"
- Recevoir un email de confirmation (si MAIL configuré)

### Vérifier la commande
```bash
# Dans php artisan tinker
Order::latest()->first();
# Devrait avoir status: 'paid' ou 'processing'
```

---

## 🧪 Test 2 : Orange Money Sandbox

### Étape 1 : Répétez les étapes 1-2 (panier + infos)

### Étape 2 : Sélectionner Orange Money
- Cochez **"Orange Money"** dans les méthodes de paiement
- Cliquez sur **"Passer la commande"**

### Étape 3 : Simulation Orange Money

**Note** : Orange Money Sandbox nécessite des credentials API valides.

**Numéros de test Orange Money** :
```
Numéro: +225 07 XX XX XX XX (format Côte d'Ivoire)
Code PIN: 1234 (dans l'interface Orange)
```

### Étape 4 : Validation
- Suivez le processus de paiement mobile
- Confirmez avec le code PIN
- La commande passe à `pending` → `processing` → `paid`

### Vérification
```bash
php artisan tinker
# Dernière commande
Order::latest()->with('transactions')->first();
# Devrait avoir transaction avec type: 'orange_money'
```

---

## 🧪 Test 3 : Wave Sandbox

### Étape 1 : Répétez les étapes 1-2 (panier + infos)

### Étape 2 : Sélectionner Wave
- Cochez **"Wave"** dans les méthodes de paiement
- Cliquez sur **"Passer la commande"**

### Étape 3 : Simulation Wave

**Numéros de test Wave** :
```
Numéro: +225 07 XX XX XX XX (format Côte d'Ivoire)
Code: Envoyé par SMS (en sandbox, check les logs)
```

### Étape 4 : Validation
- Entrez le numéro de téléphone Wave
- Confirmez avec le code reçu
- La transaction se valide automatiquement

### Vérification
```bash
php artisan tinker
Order::latest()->with('transactions')->first();
# Devrait avoir transaction avec type: 'wave'
```

---

## 🔍 Débogage

### Vérifier les logs Laravel
```bash
tail -f storage/logs/laravel.log
```

### Vérifier les routes de paiement
```bash
php artisan route:list | grep -i payment
# Ou sous Windows PowerShell:
php artisan route:list | Select-String -Pattern "payment"
```

### Routes attendues :
```
POST /paypal/create-payment
GET  /paypal/callback/success/{order_id}
GET  /paypal/callback/cancel/{order_id}

POST /orange-money/create-payment
GET  /orange-money/callback/success/{order_id}

POST /wave/create-payment
GET  /wave/callback/success/{order_id}
POST /wave/webhook
```

### Tester les webhooks (local)

Pour tester les webhooks en local, utilisez **ngrok** :

```bash
# Installer ngrok
https://ngrok.com/download

# Tunnel vers votre serveur local
ngrok http 8000

# URL exposée : https://xxxx-xxxx.ngrok.io
```

Configurez l'URL webhook dans les dashboards :
- **PayPal** : `https://xxxx-xxxx.ngrok.io/paypal/webhook`
- **Wave** : `https://xxxx-xxxx.ngrok.io/wave/webhook`

---

## 📊 Vérification des données

### Dans la base de données MySQL

```sql
-- Dernières commandes
SELECT id, order_number, status, total, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- Transactions associées
SELECT t.id, t.order_id, t.type, t.status, t.amount, pm.name as payment_method
FROM transactions t
JOIN payment_methods pm ON t.payment_method_id = pm.id
ORDER BY t.created_at DESC
LIMIT 5;

-- Méthodes de paiement actives
SELECT * FROM payment_methods WHERE is_active = 1;
```

### Via Tinker

```bash
php artisan tinker
```

```php
// Dernière commande
$order = Order::with('transactions', 'user')->latest()->first();
echo "Commande #{$order->order_number}\n";
echo "Status: {$order->status}\n";
echo "Total: {$order->total} XOF\n";

// Transactions
$order->transactions->each(function($t) {
    echo "- {$t->type}: {$t->status} ({$t->amount} XOF)\n";
});

// Méthodes de paiement actives
PaymentMethod::where('is_active', true)->get(['name', 'code', 'type']);
```

---

## ⚠️ Problèmes courants

### "Payment method not found"
```bash
# Vérifier les méthodes actives
php artisan tinker
PaymentMethod::all(['id', 'name', 'code', 'is_active']);

# Activer une méthode
PaymentMethod::where('code', 'paypal')->update(['is_active' => true]);
```

### "Invalid credentials"
- Vérifiez votre `.env` (PAYPAL_SANDBOX_CLIENT_ID, etc.)
- Assurez-vous d'être en mode `sandbox`
- Videz le cache : `php artisan config:clear`

### "Callback URL not working"
- Vérifiez que `APP_URL=http://localhost:8000` dans `.env`
- En production, utilisez l'URL publique : `APP_URL=https://votre-domaine.com`

### "Transaction failed"
```bash
# Logs Laravel
tail storage/logs/laravel.log

# Dernière transaction
php artisan tinker
Transaction::latest()->first();
```

---

## 🚀 Passer en production

### 1. Changez le mode dans `.env`
```env
PAYPAL_MODE=live
ORANGE_MONEY_MODE=live
WAVE_MODE=live
```

### 2. Ajoutez les vraies credentials
```env
PAYPAL_LIVE_CLIENT_ID=votre_id_production
PAYPAL_LIVE_CLIENT_SECRET=votre_secret_production

ORANGE_MONEY_LIVE_CLIENT_ID=...
WAVE_LIVE_API_KEY=...
```

### 3. Configurez les webhooks

**PayPal Dashboard** :
- https://developer.paypal.com
- Webhooks → `https://votre-domaine.com/paypal/webhook`

**Orange Money Dashboard** :
- Dashboard marchand Orange Money
- Webhook URL : `https://votre-domaine.com/orange-money/callback`

**Wave Dashboard** :
- https://developer.wave.com
- Webhooks → `https://votre-domaine.com/wave/webhook`

### 4. Testez avec de vraies cartes
```bash
# Mode maintenance pendant les tests
php artisan down --secret="test123"
# URL d'accès : https://votre-domaine.com/test123

# Tests de paiement avec petits montants

# Réactivation
php artisan up
```

---

## 📚 Documentation complète

- [PayPal Integration](./PAYPAL_INTEGRATION.md)
- [Orange Money Integration](./ORANGE_MONEY_INTEGRATION.md)
- [Wave Integration](./WAVE_INTEGRATION.md)
- [Payment System Status](./PAYMENT_SYSTEM_STATUS.md)

---

## 🔗 Ressources externes

- **PayPal Sandbox** : https://developer.paypal.com/dashboard
- **Orange Money API** : https://developer.orange.com/apis/
- **Wave Developer** : https://developer.wave.com
- **Ngrok** : https://ngrok.com

---

**Créé le** : 26 décembre 2025  
**Dernière mise à jour** : 26 décembre 2025
