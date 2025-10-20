# Intégration Orange Money - Guide de Configuration

## Vue d'ensemble

Cette intégration Orange Money permet aux utilisateurs de payer leurs commandes via Orange Money en suivant le flux :
1. L'utilisateur choisit Orange Money sur la page de paiement
2. Redirection vers Orange Money pour le paiement
3. Retour et confirmation dans le site après validation

## Configuration

### 1. Variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env` :

```bash
# Orange Money Configuration
ORANGE_MONEY_MODE=sandbox                           # sandbox pour test, production pour live
ORANGE_MONEY_SANDBOX_CLIENT_ID=votre_client_id_sandbox
ORANGE_MONEY_SANDBOX_CLIENT_SECRET=votre_client_secret_sandbox
ORANGE_MONEY_SANDBOX_MERCHANT_KEY=votre_merchant_key_sandbox
ORANGE_MONEY_LIVE_CLIENT_ID=votre_client_id_live
ORANGE_MONEY_LIVE_CLIENT_SECRET=votre_client_secret_live
ORANGE_MONEY_LIVE_MERCHANT_KEY=votre_merchant_key_live
ORANGE_MONEY_CURRENCY=XOF                          # Devise (XOF pour l'Afrique de l'Ouest)
ORANGE_MONEY_LOCALE=fr_FR                          # Locale pour l'interface
ORANGE_MONEY_WEBHOOK_SECRET=votre_secret_webhook    # Pour sécuriser les webhooks
```

### 2. Obtenir les identifiants Orange Money

#### Mode Sandbox (Test)
1. Connectez-vous au [Portail Développeur Orange](https://developer.orange.com/)
2. Créez une nouvelle application Orange Money
3. Récupérez le Client ID, Client Secret et Merchant Key depuis l'onglet "Sandbox"

#### Mode Production (Live)
1. Une fois les tests validés, demandez l'accès à la production
2. Récupérez les identifiants de production
3. Changez `ORANGE_MONEY_MODE=production` dans votre `.env`

### 3. Configuration dans la base de données

La méthode de paiement Orange Money doit exister dans votre table `payment_methods` :

```sql
-- Vérifier si Orange Money existe
SELECT * FROM payment_methods WHERE code = 'orange_money';

-- Si nécessaire, l'ajouter
INSERT INTO payment_methods (name, code, description, config, is_active) 
VALUES (
    'Orange Money', 
    'orange_money', 
    'Paiement mobile via Orange Money',
    '{"client_id":"","client_secret":"","merchant_key":"","mode":"sandbox","webhook_secret":""}',
    1
);
```

## API Orange Money

### Endpoints utilisés

#### Mode Sandbox
- **Base URL** : `https://api.orange.com/orange-money-webpay/dev/v1`
- **OAuth** : `/oauth/token`
- **Paiement** : `/webpayment`
- **Statut** : `/webpayment/{payment_token}`

#### Mode Production
- **Base URL** : `https://api.orange.com/orange-money-webpay/v1`
- **OAuth** : `/oauth/token`
- **Paiement** : `/webpayment`
- **Statut** : `/webpayment/{payment_token}`

## Flux de Paiement

### 1. Création du paiement
- **Route** : `POST /orange-money/create-payment`
- **Controller** : `OrangeMoneyPaymentController@createPayment`
- **Fonction** : Crée un paiement Orange Money et retourne l'URL de paiement

### 2. Retour Orange Money - Succès
- **Route** : `GET /orange-money/callback/success/{order_id}`
- **Controller** : `OrangeMoneyPaymentController@handleSuccessCallback`
- **Fonction** : Vérifie le statut et met à jour la commande

### 3. Retour Orange Money - Annulation
- **Route** : `GET /orange-money/callback/cancel/{order_id}`
- **Controller** : `OrangeMoneyPaymentController@handleCancelCallback`
- **Fonction** : Gère l'annulation du paiement

### 4. Webhook Orange Money
- **Route** : `POST /orange-money/webhook`
- **Controller** : `OrangeMoneyPaymentController@handleWebhook`
- **Fonction** : Traite les notifications de paiement en temps réel

### 5. Vérification du statut
- **Route** : `POST /orange-money/check-status`
- **Controller** : `OrangeMoneyPaymentController@checkPaymentStatus`
- **Fonction** : Vérifie le statut d'un paiement Orange Money

## Statuts de paiement

### Statuts Orange Money
- **INITIATED** → `pending` (Initié)
- **PENDING** → `pending` (En attente)
- **SUCCESS** → `completed` (Réussi)
- **FAILED** → `failed` (Échec)
- **CANCELLED** → `cancelled` (Annulé)
- **EXPIRED** → `failed` (Expiré)

## Structure des données

### Données envoyées à Orange Money
```json
{
    "merchant_key": "votre_merchant_key",
    "currency": "XOF",
    "order_id": 123,
    "amount": 10000,
    "return_url": "https://votre-site.com/orange-money/callback/success/123",
    "cancel_url": "https://votre-site.com/orange-money/callback/cancel/123",
    "notif_url": "https://votre-site.com/orange-money/webhook",
    "lang": "fr",
    "reference": "CMD-202510-0123",
    "customer_id": 456,
    "customer_email": "client@example.com",
    "customer_phone": "+225XXXXXXXX",
    "customer_firstname": "Jean",
    "customer_lastname": "Dupont"
}
```

### Réponse Orange Money
```json
{
    "payment_token": "abcdef123456",
    "payment_url": "https://webpay.orange.com/payment?token=abcdef123456",
    "status": "INITIATED"
}
```

## Pages Frontend

### 1. Succès de paiement
- **Composant** : `Frontend/Payment/Success.jsx`
- **Adapté** : Affiche les détails Orange Money

### 2. Échec de paiement
- **Composant** : `Frontend/Payment/Failed.jsx`
- **Réutilisé** : Fonctionne pour Orange Money

### 3. Annulation de paiement
- **Composant** : `Frontend/Payment/Cancelled.jsx`
- **Réutilisé** : Fonctionne pour Orange Money

## Utilisation

### Frontend (React)

Le composant `Checkout.jsx` détecte automatiquement quand Orange Money est sélectionné et :
1. Crée d'abord la commande via l'API
2. Crée le paiement Orange Money avec l'ID de commande
3. Redirige l'utilisateur vers Orange Money
4. Vide le panier avant redirection

### Backend (Laravel)

Le service `OrangeMoneyService` gère toutes les interactions avec l'API Orange Money :
- Authentification OAuth2
- Création des paiements
- Vérification du statut
- Traitement des webhooks
- Gestion des erreurs

## Sécurité

- Toutes les communications avec Orange Money sont chiffrées (HTTPS)
- Les tokens d'accès sont mis en cache et renouvelés automatiquement
- Signature des webhooks avec clé secrète (optionnelle)
- Validation des montants entre commande locale et Orange Money
- Logs détaillés de toutes les transactions

## Tests

### Mode Sandbox
1. Configurez les identifiants sandbox
2. Utilisez les numéros de test Orange Money
3. Testez tous les scénarios : succès, échec, annulation

### Numéros de test Orange Money (Sandbox)
- **Succès** : +22507000000 (code PIN : 1234)
- **Échec** : +22507000001 (code PIN : 1234)
- **Timeout** : +22507000002 (code PIN : 1234)

## Débogage

### Logs
Les logs Orange Money sont enregistrés dans `storage/logs/laravel.log` avec le préfixe `[Orange Money]`

### Erreurs courantes
1. **Invalid credentials** : Vérifiez vos Client ID/Secret/Merchant Key
2. **Invalid merchant** : Vérifiez votre Merchant Key
3. **Currency not supported** : Vérifiez que XOF est supporté
4. **Amount invalid** : Orange Money attend des entiers (pas de décimales)

## Webhooks

### Configuration
1. Ajoutez l'URL webhook dans votre configuration Orange Money : `https://votre-site.com/orange-money/webhook`
2. Configurez le secret webhook pour la sécurité

### Traitement
Le webhook permet de recevoir les notifications de paiement en temps réel, même si l'utilisateur ferme son navigateur.

## Support et maintenance

- **Documentation Orange Money** : https://developer.orange.com/apis/orange-money-webpay/
- **Support Orange Money** : contact via le portail développeur
- **Status API** : Vérifiez le statut sur le portail développeur

---

## Exemple de configuration complète

```bash
# .env
ORANGE_MONEY_MODE=sandbox
ORANGE_MONEY_SANDBOX_CLIENT_ID=votre_client_id_sandbox
ORANGE_MONEY_SANDBOX_CLIENT_SECRET=votre_client_secret_sandbox
ORANGE_MONEY_SANDBOX_MERCHANT_KEY=votre_merchant_key_sandbox
ORANGE_MONEY_CURRENCY=XOF
ORANGE_MONEY_LOCALE=fr_FR
ORANGE_MONEY_WEBHOOK_SECRET=votre_secret_webhook
```

L'intégration Orange Money est maintenant prête à l'emploi ! 🚀

## Différences avec PayPal

- Orange Money utilise des **entiers** pour les montants (pas de décimales)
- Orange Money a un système de **webhooks** natif
- Orange Money utilise des **tokens de paiement** au lieu d'IDs de paiement
- Orange Money est spécialement adapté aux **paiements mobiles africains**
