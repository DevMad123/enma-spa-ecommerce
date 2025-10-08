# Intégration Wave - Guide de Configuration

## Vue d'ensemble

Cette intégration Wave permet aux utilisateurs de payer leurs commandes via Wave en suivant le flux :
1. L'utilisateur choisit Wave sur la page de paiement
2. Redirection vers Wave pour le paiement mobile
3. Retour et confirmation dans le site après validation

## Configuration

### 1. Variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env` :

```bash
# Wave Configuration
WAVE_MODE=sandbox                      # sandbox pour test, production pour live
WAVE_SANDBOX_API_KEY=votre_api_key_sandbox
WAVE_SANDBOX_SECRET_KEY=votre_secret_key_sandbox
WAVE_LIVE_API_KEY=votre_api_key_live
WAVE_LIVE_SECRET_KEY=votre_secret_key_live
WAVE_CURRENCY=XOF                      # Devise (XOF pour l'Afrique de l'Ouest)
WAVE_WEBHOOK_SECRET=votre_webhook_secret
```

### 2. Obtenir les identifiants Wave

#### Mode Sandbox (Test)
1. Connectez-vous à [Wave Developer Portal](https://developers.wave.com/)
2. Créez une nouvelle application ou utilisez une existante
3. Récupérez l'API Key et Secret Key depuis l'onglet "Sandbox"

#### Mode Production (Live)
1. Une fois les tests validés, passez en mode production
2. Récupérez les identifiants de production
3. Changez `WAVE_MODE=production` dans votre `.env`

### 3. Configuration dans la base de données

Wave est automatiquement configuré dans votre table `payment_methods` :

```sql
-- Wave est déjà créé via la migration
SELECT * FROM payment_methods WHERE code = 'wave';
```

## Flux de Paiement

### 1. Création du paiement
- **Route** : `POST /wave/create-payment`
- **Controller** : `WavePaymentController@createPayment`
- **Fonction** : Crée une session de checkout Wave et retourne l'URL

### 2. Retour Wave - Succès
- **Route** : `GET /wave/callback/success/{order_id}`
- **Controller** : `WavePaymentController@handleSuccessCallback`
- **Fonction** : Vérifie le paiement et met à jour la commande

### 3. Retour Wave - Annulation
- **Route** : `GET /wave/callback/cancel/{order_id}`
- **Controller** : `WavePaymentController@handleCancelCallback`
- **Fonction** : Gère l'annulation du paiement

### 4. Webhook Wave
- **Route** : `POST /wave/webhook`
- **Controller** : `WavePaymentController@handleWebhook`
- **Fonction** : Traite les notifications en temps réel

### 5. Vérification du statut
- **Route** : `POST /wave/check-status`
- **Controller** : `WavePaymentController@checkPaymentStatus`
- **Fonction** : Vérifie le statut d'un paiement Wave

### 6. Remboursement
- **Route** : `POST /wave/refund`
- **Controller** : `WavePaymentController@refundPayment`
- **Fonction** : Effectue un remboursement total ou partiel

## Structure des données

### Table `transactions` (réutilisée)
La même table que PayPal et Orange Money est utilisée pour Wave :

```sql
-- Exemple d'enregistrement Wave
{
    "sell_id": 123,
    "payment_method_id": 4,
    "transaction_id": "cs_1234567890",
    "payment_id": "cs_1234567890",
    "amount": 25000.00,
    "currency": "XOF",
    "status": "completed",
    "type": "payment",
    "gateway_response": {...}
}
```

## Pages Frontend

### 1. Succès de paiement
- **Composant** : `Frontend/Payment/Success.jsx`
- **Fonctionnalités** : Affichage adapté pour Wave avec logo et détails

### 2. Échec de paiement
- **Composant** : `Frontend/Payment/Failed.jsx`
- **Fonctionnalités** : Gestion des erreurs Wave

### 3. Annulation de paiement
- **Composant** : `Frontend/Payment/Cancelled.jsx`
- **Fonctionnalités** : Gestion des annulations Wave

## Utilisation

### Frontend (React)

Le composant `Checkout.jsx` détecte automatiquement quand Wave est sélectionné et :
1. Crée d'abord la commande via l'API
2. Crée la session checkout Wave avec l'ID de commande
3. Redirige l'utilisateur vers Wave
4. Vide le panier avant redirection

### Backend (Laravel)

Le service `WaveService` gère toutes les interactions avec l'API Wave :
- Authentification par API Key
- Création des sessions de checkout
- Vérification des statuts
- Traitement des webhooks
- Gestion des remboursements

## API Wave utilisée

Cette intégration utilise l'API REST Wave v1 avec :
- **Authentification** : API Key + Secret Key
- **Endpoint Sandbox** : `https://api.wave.com/v1/sandbox`
- **Endpoint Production** : `https://api.wave.com/v1`
- **Devises supportées** : XOF (Franc CFA), EUR, USD

## Spécificités Wave

- **Checkout Sessions** : Système de sessions de paiement
- **Montants en entiers** : Pas de décimales dans l'API
- **Webhooks natifs** : Notifications en temps réel
- **Remboursements** : Support des remboursements partiels et totaux
- **Support mobile** : Optimisé pour les paiements mobiles

## Statuts Wave

### Statuts des sessions
- `open` → `pending` (En attente)
- `pending` → `pending` (En cours)
- `complete` → `completed` (Complété)
- `expired` → `failed` (Expiré)
- `cancelled` → `cancelled` (Annulé)

### Événements webhook
- `checkout.session.completed` : Paiement réussi
- `checkout.session.expired` : Session expirée
- `checkout.session.cancelled` : Paiement annulé

## Sécurité

- **API Keys sécurisées** : Stockage sécurisé des clés
- **Signatures webhook** : Validation des notifications
- **HTTPS obligatoire** : Toutes les communications chiffrées
- **Validation des montants** : Vérification entre commande et paiement

## Tests

### Mode Sandbox
1. Configurez les identifiants sandbox
2. Utilisez les numéros de test Wave
3. Testez tous les scénarios : succès, échec, annulation, webhook

### Numéros de test Wave
- **Succès** : 70000000 (paiement réussi)
- **Échec** : 70000001 (paiement échoué)
- **Timeout** : 70000002 (expiration)

## Débogage

### Logs
Les logs Wave sont enregistrés dans `storage/logs/laravel.log` avec le préfixe `[Wave]`

### Erreurs courantes
1. **Invalid API Key** : Vérifiez vos clés API
2. **Amount too small** : Montant minimum requis
3. **Currency not supported** : Vérifiez la devise
4. **Webhook signature invalid** : Vérifiez le secret webhook

## Avantages

- **Intégration native** : API REST moderne
- **Remboursements** : Support natif des remboursements
- **Webhooks** : Notifications temps réel
- **Mobile-first** : Optimisé pour mobile
- **Multi-devises** : Support XOF, EUR, USD

## Support

- **Documentation Wave** : https://developers.wave.com/docs/
- **Support Wave** : https://support.wave.com/
- **Statuts API** : https://status.wave.com/

---

## Exemple de configuration complète

```bash
# .env
WAVE_MODE=sandbox
WAVE_SANDBOX_API_KEY=wsk_test_1234567890abcdef
WAVE_SANDBOX_SECRET_KEY=wsk_test_abcdef1234567890
WAVE_CURRENCY=XOF
WAVE_WEBHOOK_SECRET=whsec_1234567890abcdef
```

L'intégration Wave est maintenant prête à l'emploi ! 🌊💙