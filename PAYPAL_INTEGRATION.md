# Intégration PayPal - Guide de Configuration

## Vue d'ensemble

Cette intégration PayPal permet aux utilisateurs de payer leurs commandes via PayPal en suivant le flux :
1. L'utilisateur choisit PayPal sur la page de paiement
2. Redirection vers PayPal pour le paiement
3. Retour et confirmation dans le site après validation

## Configuration

### 1. Variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env` :

```bash
# PayPal Configuration
PAYPAL_MODE=sandbox                    # sandbox pour test, live pour production
PAYPAL_SANDBOX_CLIENT_ID=votre_client_id_sandbox
PAYPAL_SANDBOX_CLIENT_SECRET=votre_client_secret_sandbox
PAYPAL_LIVE_CLIENT_ID=votre_client_id_live
PAYPAL_LIVE_CLIENT_SECRET=votre_client_secret_live
PAYPAL_CURRENCY=XOF                    # Devise (XOF pour l'Afrique de l'Ouest)
PAYPAL_LOCALE=fr_FR                    # Locale pour l'interface PayPal
```

### 2. Obtenir les identifiants PayPal

#### Mode Sandbox (Test)
1. Connectez-vous à [PayPal Developer](https://developer.paypal.com/)
2. Créez une nouvelle application ou utilisez une existante
3. Récupérez le Client ID et Client Secret depuis l'onglet "Sandbox"

#### Mode Live (Production)
1. Une fois les tests validés, passez en mode live
2. Récupérez les identifiants de production
3. Changez `PAYPAL_MODE=live` dans votre `.env`

### 3. Configuration dans la base de données

Assurez-vous d'avoir une méthode de paiement PayPal dans votre table `payment_methods` :

```sql
INSERT INTO payment_methods (name, code, description, config, is_active) 
VALUES (
    'PayPal', 
    'paypal', 
    'Paiement sécurisé via PayPal',
    '{"sandbox_client_id":"","sandbox_client_secret":"","live_client_id":"","live_client_secret":"","mode":"sandbox"}',
    1
);
```

## Flux de Paiement

### 1. Création du paiement
- **Route** : `POST /paypal/create-payment`
- **Controller** : `PayPalPaymentController@createPayment`
- **Fonction** : Crée un paiement PayPal et retourne l'URL d'approbation

### 2. Retour PayPal - Succès
- **Route** : `GET /paypal/callback/success/{order_id}`
- **Controller** : `PayPalPaymentController@handleSuccessCallback`
- **Fonction** : Capture le paiement et met à jour la commande

### 3. Retour PayPal - Annulation
- **Route** : `GET /paypal/callback/cancel/{order_id}`
- **Controller** : `PayPalPaymentController@handleCancelCallback`
- **Fonction** : Gère l'annulation du paiement

### 4. Vérification du statut
- **Route** : `POST /paypal/check-status`
- **Controller** : `PayPalPaymentController@checkPaymentStatus`
- **Fonction** : Vérifie le statut d'un paiement PayPal

## Structure des données

### Table `transactions`
```sql
CREATE TABLE transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sell_id BIGINT UNSIGNED NOT NULL,
    payment_method_id BIGINT UNSIGNED NOT NULL,
    transaction_id VARCHAR(255),
    payment_id VARCHAR(255),
    payer_id VARCHAR(255),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    type ENUM('payment', 'refund', 'partial_refund') DEFAULT 'payment',
    gateway_response JSON,
    processed_at TIMESTAMP NULL,
    notes TEXT,
    timestamps
);
```

## Pages Frontend

### 1. Succès de paiement
- **Composant** : `Frontend/Payment/Success.jsx`
- **Route** : Définie par PayPal callback success

### 2. Échec de paiement
- **Composant** : `Frontend/Payment/Failed.jsx`
- **Route** : Définie par PayPal callback ou erreur

### 3. Annulation de paiement
- **Composant** : `Frontend/Payment/Cancelled.jsx`
- **Route** : Définie par PayPal callback cancel

## Utilisation

### Frontend (React)

Le composant `Checkout.jsx` détecte automatiquement quand PayPal est sélectionné et :
1. Crée d'abord la commande via l'API
2. Crée le paiement PayPal avec l'ID de commande
3. Redirige l'utilisateur vers PayPal
4. Vide le panier avant redirection

### Backend (Laravel)

Le service `PayPalService` gère toutes les interactions avec l'API PayPal :
- Authentification OAuth2
- Création des paiements
- Capture des paiements
- Gestion des erreurs

## API PayPal utilisée

Cette intégration utilise l'API REST PayPal v2 avec :
- **Authentification** : OAuth2 avec Client Credentials
- **Endpoint** : Sandbox : `https://api-m.sandbox.paypal.com` | Live : `https://api-m.paypal.com`
- **Devises supportées** : XOF (Franc CFA), EUR, USD, etc.

## Sécurité

- Toutes les communications avec PayPal sont chiffrées (HTTPS)
- Les tokens d'accès sont mis en cache et renouvelés automatiquement
- Les webhooks PayPal peuvent être ajoutés pour une sécurité renforcée
- Validation des montants entre commande locale et PayPal

## Tests

### Mode Sandbox
1. Configurez les identifiants sandbox
2. Utilisez les comptes de test PayPal
3. Testez tous les scénarios : succès, échec, annulation

### Comptes de test PayPal
- **Acheteur** : sb-buyer@business.example.com (password: 12345678)
- **Vendeur** : sb-seller@business.example.com (password: 12345678)

## Débogage

### Logs
Les logs PayPal sont enregistrés dans `storage/logs/laravel.log` avec le préfixe `[PayPal]`

### Erreurs courantes
1. **Invalid credentials** : Vérifiez vos Client ID/Secret
2. **Currency not supported** : Vérifiez que XOF est supporté dans votre région
3. **Amount mismatch** : Vérifiez la conversion des montants

## Support et maintenance

- **Documentation PayPal** : https://developer.paypal.com/docs/
- **Support PayPal** : https://www.paypal.com/support/
- **Statuts API** : https://www.paypal-status.com/

---

## Exemple de configuration complète

```bash
# .env
PAYPAL_MODE=sandbox
PAYPAL_SANDBOX_CLIENT_ID=AYourSandboxClientIDHere
PAYPAL_SANDBOX_CLIENT_SECRET=YourSandboxClientSecretHere
PAYPAL_CURRENCY=XOF
PAYPAL_LOCALE=fr_FR
```

L'intégration PayPal est maintenant prête à l'emploi ! 🎉
