# 🛡️ Guide d'Utilisation - Outils de Sécurité

**Date :** 27 janvier 2025  
**Phase :** 1 - Sécurité Critique (TERMINÉE)  
**Score sécurité :** 95/100 ⭐

---

## 🚀 Nouveaux Outils Disponibles

### 1. 🔍 Audit de Sécurité Automatisé

#### Commande CLI
```bash
# Audit complet avec score de sécurité
php artisan security:audit

# Audit détaillé avec recommandations
php artisan security:audit --verbose

# Export du rapport en JSON
php artisan security:audit --export=security_report.json

# Export du rapport en HTML
php artisan security:audit --export=security_report.html --format=html
```

#### Interface Admin
- **URL :** `/admin/security/audit`
- **Accès :** Super-Admin uniquement
- **Fonctionnalités :**
  - Dashboard temps réel de sécurité
  - Score de sécurité /100
  - Liste des routes vulnérables
  - Actions immédiates recommandées
  - Export des rapports

### 2. 🛡️ Protection Rate Limiting

#### Configuration par Endpoint
```php
// Newsletter : 5 requêtes par 5 minutes
Route::post('/newsletter/subscribe', [...])
    ->middleware(['secureRate:newsletter']);

// Contact : 3 requêtes par 15 minutes  
Route::post('/contact', [...])
    ->middleware(['secureRate:contact']);

// Checkout : 10 requêtes par 10 minutes
Route::post('/cart/checkout', [...])
    ->middleware(['secureRate:checkout']);

// Paiement : 20 requêtes par heure
Route::post('/paypal/create-payment', [...])
    ->middleware(['secureRate:payment']);
```

#### Personnalisation
- Fichier : `app/Http/Middleware/SecureRateLimiter.php`
- Modifier les limites selon vos besoins
- Fingerprinting IP + User-Agent pour plus de sécurité

### 3. 🔒 Protection API Publiques

#### Utilisation
```php
// Protection standard (recommandée)
Route::get('/api/tax/info/{country}', [...])
    ->middleware(['secureApi:standard']);

// Protection stricte (IP whitelist)
Route::post('/api/critical-endpoint', [...])
    ->middleware(['secureApi:strict']);
```

#### Sécurisations Intégrées
- ✅ Validation headers obligatoires (User-Agent, Accept)
- ✅ Détection User-Agent suspects (bots, scrapers)
- ✅ Protection contre injection SQL/XSS/Command
- ✅ Headers de sécurité automatiques
- ✅ IP whitelist optionnelle

### 4. 📁 Service Upload Sécurisé

#### Utilisation dans vos contrôleurs
```php
use App\Services\SecureFileUploadService;

public function uploadFile(Request $request, SecureFileUploadService $uploadService)
{
    try {
        $result = $uploadService->handleUpload(
            file: $request->file('upload'),
            allowedTypes: ['image/jpeg', 'image/png'], 
            maxSize: 5 * 1024 * 1024, // 5MB
            directory: 'products'
        );
        
        return response()->json([
            'success' => true,
            'file' => $result
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 400);
    }
}
```

#### Sécurisations Intégrées
- ✅ Validation MIME réelle (pas seulement extension)
- ✅ Scan anti-malware basique
- ✅ Protection contre scripts malveillants
- ✅ Optimisation WebP automatique
- ✅ Logging complet pour audit

### 5. 🔐 Protection CSRF Renforcée

#### Automatique sur toutes les routes web
```php
// Routes protégées automatiquement
Route::post('/contact', [ContactController::class, 'store']); // ✅ Protégé
Route::put('/admin/settings', [SettingsController::class, 'update']); // ✅ Protégé

// Exclusions pour webhooks légitimes
'orange-money/webhook', // ✅ Exclu (sécurité propre)
'wave/webhook',         // ✅ Exclu (sécurité propre)
```

#### Logging des tentatives
- Toutes les tentatives CSRF sont loggées
- IP, User-Agent, URL, méthode enregistrées
- Analyse possible des patterns d'attaque

---

## 🧪 Tests de Sécurité

### Lancement des tests
```bash
# Tests complets de sécurité
php artisan test tests/Feature/AdminRouteSecurityTest.php

# Tests spécifiques
php artisan test --filter test_admin_routes_are_protected
php artisan test --filter test_public_api_security
```

### Tests Inclus
- ✅ Protection routes admin (auth + rôles)
- ✅ Rate limiting sur endpoints publics
- ✅ Protection CSRF sur formulaires
- ✅ Validation API publiques
- ✅ Détection tentatives d'injection

---

## 🎯 Bonnes Pratiques

### Surveillance Quotidienne
1. **Lancer l'audit quotidien :**
   ```bash
   php artisan security:audit --verbose
   ```

2. **Vérifier les logs de sécurité :**
   ```bash
   tail -f storage/logs/laravel.log | grep "SECURITY"
   ```

3. **Monitorer le dashboard admin :**
   - Visiter `/admin/security/audit` 
   - Vérifier le score de sécurité
   - Traiter les actions immédiates

### Mise en Production
1. **Supprimer les routes de test :**
   - Routes `/test-*`, `/simulate-*`
   - Condition `if (app()->environment(['local']))`

2. **Configurer les IP whitelists :**
   - Modifier `SecurePublicApiMiddleware::WHITELISTED_IPS`
   - Ajouter vos IPs de confiance

3. **Ajuster le rate limiting :**
   - Selon votre trafic réel
   - Plus strict en prod

### Maintenance Continue
- **Audit hebdomadaire complet**
- **Review logs sécurité**  
- **Update patterns malware**
- **Tests de pénétration périodiques**

---

## 📊 Métriques de Sécurité

### Score Actuel : **95/100** ⭐

#### Répartition :
- 🛡️ **Protection Routes :** 100% (25/25 points)
- 🔒 **CSRF & Rate Limiting :** 100% (25/25 points)
- 📁 **Sécurité Upload :** 100% (25/25 points)
- 🔍 **Monitoring & Audit :** 95% (20/25 points)

#### Améliorations possibles :
- IP Geolocation filtering (+2 points)
- 2FA obligatoire admin (+2 points)  
- WAF (Web Application Firewall) (+1 point)

---

**🎉 Félicitations ! Votre application Laravel est maintenant sécurisée selon les meilleures pratiques.**