# 📧 Configuration SMTP des Emails en Production

## 📋 Vue d'ensemble

Ce guide explique comment configurer l'envoi d'emails en production pour :
- ✉️ Confirmations de commandes
- 📦 Notifications d'expédition
- 🔔 Alertes administrateur
- 📬 Réponses aux messages de contact
- 📰 Newsletters

---

## 🎯 Choisir un service SMTP

### Comparaison des services

| Service | Gratuit/Mois | Avantages | Inconvénients |
|---------|--------------|-----------|---------------|
| **SendGrid** | 100 emails/jour | Fiable, bonne délivrabilité | Configuration API |
| **Mailgun** | 1000 emails | Facile, documentation claire | Vérification domaine requise |
| **Gmail** | 500 emails/jour | Gratuit, simple | Limité, peut être bloqué |
| **Amazon SES** | 62000 emails | Très scalable, bon prix | Configuration AWS complexe |
| **Brevo** | 300 emails/jour | Interface simple | Support limité en gratuit |

---

## ⚙️ Configuration SMTP

### Option 1 : SendGrid (Recommandé)

#### 1. Créer un compte
- Allez sur https://signup.sendgrid.com
- Créez un compte gratuit
- Vérifiez votre email

#### 2. Créer une clé API
```
Dashboard → Settings → API Keys → Create API Key
Nom: "Enma Ecommerce Production"
Permissions: "Full Access" ou "Mail Send"
Copiez la clé (elle ne sera affichée qu'une fois!)
```

#### 3. Vérifier votre domaine
```
Dashboard → Settings → Sender Authentication → Verify a Domain
Domaine: votre-domaine.com
Ajoutez les enregistrements DNS fournis
```

#### 4. Configuration .env
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@votre-domaine.com
MAIL_FROM_NAME="${APP_NAME}"
```

#### 5. Tester
```bash
php artisan tinker
```
```php
Mail::raw('Test email depuis Laravel', function($msg) {
    $msg->to('votre-email@gmail.com')
        ->subject('Test SendGrid');
});
```

---

### Option 2 : Gmail (Simple mais limité)

#### 1. Activer l'authentification à 2 facteurs
- Allez sur https://myaccount.google.com/security
- Activez "Validation en deux étapes"

#### 2. Créer un mot de passe d'application
```
Compte Google → Sécurité → Validation en deux étapes
→ Mots de passe des applications
App: "Enma Ecommerce"
Appareil: "Serveur Web"
→ Générer
Copiez le mot de passe de 16 caractères (format: xxxx-xxxx-xxxx-xxxx)
```

#### 3. Configuration .env
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre-email@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=votre-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

#### ⚠️ Limitations Gmail
- Maximum 500 emails/jour
- Risque de blocage si volume élevé
- Non recommandé pour production à grande échelle

---

### Option 3 : Mailgun (Bon compromis)

#### 1. Créer un compte
- Allez sur https://signup.mailgun.com
- Créez un compte gratuit (1000 emails/mois)

#### 2. Ajouter votre domaine
```
Dashboard → Sending → Domains → Add New Domain
Domaine: mg.votre-domaine.com (sous-domaine recommandé)
Ajoutez les enregistrements DNS (TXT, MX, CNAME)
```

#### 3. Obtenir les credentials
```
Votre domaine → Domain Settings → SMTP credentials
Username: postmaster@mg.votre-domaine.com
Password: (générer un nouveau mot de passe SMTP)
```

#### 4. Configuration .env
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=postmaster@mg.votre-domaine.com
MAIL_PASSWORD=votre_password_smtp
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@votre-domaine.com
MAIL_FROM_NAME="${APP_NAME}"

# Pour l'API Mailgun (optionnel)
MAILGUN_DOMAIN=mg.votre-domaine.com
MAILGUN_SECRET=key-xxxxxxxxxxxxxxxxxxxxxx
MAILGUN_ENDPOINT=api.mailgun.net
```

---

### Option 4 : Amazon SES (Scalable)

#### 1. Créer un compte AWS
- Allez sur https://aws.amazon.com
- Créez un compte (carte bancaire requise)

#### 2. Vérifier votre email/domaine
```
AWS Console → Amazon SES → Verified identities
→ Create identity
Type: Email address ou Domain
Email: noreply@votre-domaine.com
Confirmez l'email reçu
```

#### 3. Créer un utilisateur IAM SMTP
```
AWS Console → IAM → Users → Create user
Nom: "enma-smtp-user"
Permissions: "AmazonSESFullAccess"
→ Security credentials → Create access key
Type: "SMTP credentials"
Notez: Username SMTP et Password SMTP
```

#### 4. Sortir du Sandbox Mode
```
Amazon SES → Account Dashboard → Request production access
Raison: "Application e-commerce avec confirmations de commande"
(Peut prendre 24-48h pour approbation)
```

#### 5. Configuration .env
```env
MAIL_MAILER=smtp
MAIL_HOST=email-smtp.eu-west-1.amazonaws.com
MAIL_PORT=587
MAIL_USERNAME=AKIAIOSFODNN7EXAMPLE
MAIL_PASSWORD=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@votre-domaine.com
MAIL_FROM_NAME="${APP_NAME}"

AWS_REGION=eu-west-1
```

**Régions AWS communes** :
- `us-east-1` : USA Est (Virginie)
- `eu-west-1` : Europe (Irlande)
- `eu-west-3` : Europe (Paris)
- `ap-southeast-1` : Asie (Singapour)

---

### Option 5 : Brevo (Ex-Sendinblue)

#### 1. Créer un compte
- Allez sur https://www.brevo.com
- Créez un compte gratuit (300 emails/jour)

#### 2. Obtenir les credentials SMTP
```
Settings → SMTP & API → SMTP
Server: smtp-relay.brevo.com
Port: 587
Login: votre_email@example.com
SMTP Key: (cliquez sur "Generate new SMTP key")
```

#### 3. Configuration .env
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=votre-email@example.com
MAIL_PASSWORD=xsmtpsib-xxxxxxxxxxxxxx
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@votre-domaine.com
MAIL_FROM_NAME="${APP_NAME}"
```

---

### Option 6 : SMTP Hébergeur Web

Si votre hébergeur web (OVH, Hostinger, etc.) fournit SMTP :

#### Configuration type
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.votre-hebergeur.com
MAIL_PORT=587                           # ou 465 pour SSL
MAIL_USERNAME=noreply@votre-domaine.com
MAIL_PASSWORD=votre_mot_de_passe
MAIL_ENCRYPTION=tls                     # ou ssl
MAIL_FROM_ADDRESS=noreply@votre-domaine.com
MAIL_FROM_NAME="${APP_NAME}"
```

**Exemples d'hébergeurs** :
- **OVH** : `ssl0.ovh.net` (port 587 TLS ou 465 SSL)
- **Hostinger** : `smtp.hostinger.com` (port 587)
- **o2switch** : `mail.votre-domaine.com` (port 587)

---

## 🧪 Tester la configuration

### Test 1 : Email simple via Tinker

```bash
php artisan tinker
```

```php
use Illuminate\Support\Facades\Mail;

Mail::raw('Ceci est un email de test depuis Laravel.', function($message) {
    $message->to('votre-email@gmail.com')
            ->subject('Test SMTP Enma Ecommerce');
});

// Si pas d'erreur, l'email est envoyé !
```

### Test 2 : Vérifier la configuration

```bash
php artisan config:clear
php artisan config:cache

# Afficher la config mail
php artisan tinker
```

```php
config('mail');
// Vérifiez : mailer, host, port, username, encryption
```

### Test 3 : Email de commande (simulation)

```bash
php artisan tinker
```

```php
use App\Models\Sell as Order;
use App\Mail\OrderConfirmationMail;
use Illuminate\Support\Facades\Mail;

// Récupérer une commande
$order = Order::with('customer', 'sellLines.product')->first();

// Envoyer l'email
Mail::to('votre-email@gmail.com')->send(new OrderConfirmationMail($order));
```

### Test 4 : Vérifier les logs

```bash
# Logs Laravel
tail -f storage/logs/laravel.log

# Chercher les erreurs SMTP
grep -i "mail\|smtp" storage/logs/laravel.log
```

---

## 🔧 Configuration avancée

### File d'attente (Queues)

Pour ne pas bloquer les requêtes HTTP lors de l'envoi d'emails :

#### 1. Configuration .env
```env
QUEUE_CONNECTION=database   # ou redis
```

#### 2. Créer la table des jobs
```bash
php artisan queue:table
php artisan migrate
```

#### 3. Lancer le worker (en production)
```bash
# Supervisor ou systemd
php artisan queue:work --tries=3 --timeout=90
```

#### 4. Configuration Supervisor
Créez `/etc/supervisor/conf.d/enma-worker.conf` :

```ini
[program:enma-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/enma-ecommerce/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/enma-ecommerce/storage/logs/worker.log
stopwaitsecs=3600
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start enma-worker:*
```

### Rate Limiting (Limiter l'envoi)

Pour éviter le spam et respecter les quotas SMTP :

**config/mail.php** :
```php
'rate_limit' => [
    'max_attempts' => 100,  // Max emails
    'decay_minutes' => 60,  // Par heure
],
```

### Templates d'emails personnalisés

Vos templates sont dans `resources/views/emails/` :
- `order-confirmation.blade.php`
- `new-order-admin.blade.php`
- `new-contact-message.blade.php`

Personnalisez-les avec votre logo et couleurs :

```blade
<div style="background-color: #667eea; padding: 20px; text-align: center;">
    <img src="{{ asset('images/logo.png') }}" alt="Logo" style="max-width: 200px;">
</div>
```

---

## 🚨 Dépannage

### Erreur : "Connection could not be established"

**Causes possibles** :
1. Mauvais host/port
2. Firewall bloque le port SMTP
3. Credentials incorrects

**Solutions** :
```bash
# Tester la connexion TCP
telnet smtp.sendgrid.net 587
# Ou avec PowerShell:
Test-NetConnection -ComputerName smtp.sendgrid.net -Port 587

# Vider le cache
php artisan config:clear
php artisan cache:clear
```

### Erreur : "Authentication failed"

**Solutions** :
1. Vérifiez `MAIL_USERNAME` et `MAIL_PASSWORD`
2. Gmail : utilisez un mot de passe d'application
3. SendGrid : `MAIL_USERNAME` doit être exactement `apikey`

### Emails en spam

**Solutions** :
1. **Vérifier SPF** : Ajoutez à votre DNS
   ```
   Type: TXT
   Nom: @
   Valeur: v=spf1 include:sendgrid.net ~all
   ```

2. **Vérifier DKIM** : Configurez dans votre service SMTP

3. **Vérifier DMARC** :
   ```
   Type: TXT
   Nom: _dmarc
   Valeur: v=DMARC1; p=none; rua=mailto:admin@votre-domaine.com
   ```

4. **Tester avec** : https://www.mail-tester.com

### Emails non reçus

**Checklist** :
- [ ] Vérifiez les spams/courrier indésirable
- [ ] Vérifiez les logs : `storage/logs/laravel.log`
- [ ] Testez avec un autre email
- [ ] Vérifiez les quotas du service SMTP
- [ ] Vérifiez `MAIL_FROM_ADDRESS` (doit être vérifié)

---

## 📊 Monitoring et statistiques

### Logs d'emails

Activez le logging dans `.env` :
```env
LOG_CHANNEL=stack
LOG_LEVEL=info
```

Tous les emails seront loggés dans `storage/logs/laravel.log`.

### Dashboard SMTP

Chaque service fournit un dashboard :
- **SendGrid** : https://app.sendgrid.com/statistics
- **Mailgun** : https://app.mailgun.com/app/sending/domains
- **Amazon SES** : AWS Console → SES → Reputation metrics

### Notifications d'échec

Créez un listener pour les échecs d'envoi :

**app/Providers/EventServiceProvider.php** :
```php
protected $listen = [
    'Illuminate\Mail\Events\MessageSending' => [
        'App\Listeners\LogSentMessage',
    ],
    'Illuminate\Mail\Events\MessageSent' => [
        'App\Listeners\LogSentMessage',
    ],
];
```

---

## ✅ Checklist Production

Avant de déployer :

- [ ] Service SMTP choisi et compte créé
- [ ] Domaine vérifié (SPF, DKIM, DMARC)
- [ ] Variables .env configurées
- [ ] Configuration testée avec `php artisan tinker`
- [ ] Email de confirmation testé
- [ ] Queues configurées (pour performances)
- [ ] Supervisor configuré (pour queues)
- [ ] Monitoring activé
- [ ] Limites de débit configurées
- [ ] Templates personnalisés avec logo

---

## 📚 Ressources

### Documentation officielle
- **Laravel Mail** : https://laravel.com/docs/11.x/mail
- **SendGrid PHP** : https://github.com/sendgrid/sendgrid-php
- **Mailgun PHP** : https://documentation.mailgun.com/en/latest/api-intro.html

### Services SMTP
- **SendGrid** : https://sendgrid.com
- **Mailgun** : https://www.mailgun.com
- **Amazon SES** : https://aws.amazon.com/ses/
- **Brevo** : https://www.brevo.com
- **Gmail SMTP** : https://support.google.com/mail/answer/7126229

### Outils de test
- **Mail Tester** : https://www.mail-tester.com
- **MX Toolbox** : https://mxtoolbox.com
- **Mailtrap** (dev) : https://mailtrap.io

---

**Créé le** : 26 décembre 2025  
**Dernière mise à jour** : 26 décembre 2025
