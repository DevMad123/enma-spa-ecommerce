#!/usr/bin/env php
<?php

/**
 * Script de validation de configuration production
 * Vérifie que toutes les configurations critiques sont correctement définies
 */

echo "\n";
echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║  VALIDATION CONFIGURATION PRODUCTION - ENMA E-COMMERCE         ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n";
echo "\n";

$errors = [];
$warnings = [];
$success = [];

// Charger Laravel
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// ============================================
// 1. VÉRIFICATIONS CRITIQUES (ERREURS)
// ============================================

echo "🔴 VÉRIFICATIONS CRITIQUES\n";
echo str_repeat("-", 64) . "\n";

// APP_ENV
if (env('APP_ENV') !== 'production') {
    $errors[] = "APP_ENV n'est pas 'production' (valeur: " . env('APP_ENV') . ")";
} else {
    $success[] = "APP_ENV = production ✓";
}

// APP_DEBUG
if (env('APP_DEBUG') === true || env('APP_DEBUG') === 'true') {
    $errors[] = "APP_DEBUG est activé (DOIT être false en production)";
} else {
    $success[] = "APP_DEBUG = false ✓";
}

// APP_KEY
if (empty(env('APP_KEY'))) {
    $errors[] = "APP_KEY n'est pas défini (exécutez: php artisan key:generate)";
} else {
    $success[] = "APP_KEY est défini ✓";
}

// APP_URL
$appUrl = env('APP_URL');
if (empty($appUrl)) {
    $errors[] = "APP_URL n'est pas défini";
} elseif (strpos($appUrl, 'localhost') !== false || strpos($appUrl, '127.0.0.1') !== false) {
    $errors[] = "APP_URL contient localhost (doit être votre vrai domaine)";
} elseif (strpos($appUrl, 'https://') !== 0) {
    $errors[] = "APP_URL doit commencer par https:// (valeur: $appUrl)";
} else {
    $success[] = "APP_URL configuré avec HTTPS ✓";
}

// Base de données
$dbConnection = env('DB_CONNECTION');
$dbDatabase = env('DB_DATABASE');
$dbUsername = env('DB_USERNAME');

if (empty($dbConnection)) {
    $errors[] = "DB_CONNECTION n'est pas défini";
}

if (empty($dbDatabase)) {
    $errors[] = "DB_DATABASE n'est pas défini";
} else {
    $success[] = "DB_DATABASE = $dbDatabase ✓";
}

if (empty($dbUsername)) {
    $errors[] = "DB_USERNAME n'est pas défini";
} elseif ($dbUsername === 'root') {
    $warnings[] = "DB_USERNAME = root (utilisez un utilisateur dédié en production)";
} else {
    $success[] = "DB_USERNAME = $dbUsername ✓";
}

// Connexion à la base de données
try {
    DB::connection()->getPdo();
    $success[] = "Connexion base de données : OK ✓";
} catch (\Exception $e) {
    $errors[] = "Connexion base de données échouée : " . $e->getMessage();
}

// Session sécurisée
if (env('SESSION_SECURE_COOKIE') !== true && env('SESSION_SECURE_COOKIE') !== 'true') {
    $warnings[] = "SESSION_SECURE_COOKIE n'est pas true (recommandé avec HTTPS)";
}

// SEED_ON_BOOT
if (env('SEED_ON_BOOT') === true || env('SEED_ON_BOOT') === 'true') {
    $errors[] = "SEED_ON_BOOT est activé (DOIT être false en production)";
} else {
    $success[] = "SEED_ON_BOOT = false ✓";
}

echo "\n";

// ============================================
// 2. VÉRIFICATIONS PAIEMENTS
// ============================================

echo "🟡 CONFIGURATION PAIEMENTS\n";
echo str_repeat("-", 64) . "\n";

// PayPal
$paypalMode = env('PAYPAL_MODE');
if ($paypalMode === 'sandbox') {
    $warnings[] = "PayPal en mode SANDBOX (changez en 'live' pour production)";
} elseif ($paypalMode === 'live') {
    if (empty(env('PAYPAL_LIVE_CLIENT_ID')) || empty(env('PAYPAL_LIVE_CLIENT_SECRET'))) {
        $errors[] = "PayPal en mode live mais clés LIVE manquantes";
    } else {
        $success[] = "PayPal configuré en mode LIVE ✓";
    }
}

// Orange Money
$orangeMode = env('ORANGE_MONEY_MODE');
if ($orangeMode === 'sandbox') {
    $warnings[] = "Orange Money en mode SANDBOX (changez en 'live' pour production)";
} elseif ($orangeMode === 'live') {
    if (empty(env('ORANGE_MONEY_LIVE_CLIENT_ID')) || empty(env('ORANGE_MONEY_LIVE_CLIENT_SECRET'))) {
        $errors[] = "Orange Money en mode live mais clés LIVE manquantes";
    } else {
        $success[] = "Orange Money configuré en mode LIVE ✓";
    }
}

// Wave
$waveMode = env('WAVE_MODE');
if ($waveMode === 'sandbox') {
    $warnings[] = "Wave en mode SANDBOX (changez en 'live' pour production)";
} elseif ($waveMode === 'live') {
    if (empty(env('WAVE_LIVE_API_KEY')) || empty(env('WAVE_LIVE_SECRET_KEY'))) {
        $errors[] = "Wave en mode live mais clés LIVE manquantes";
    } else {
        $success[] = "Wave configuré en mode LIVE ✓";
    }
}

echo "\n";

// ============================================
// 3. VÉRIFICATIONS EMAIL
// ============================================

echo "📧 CONFIGURATION EMAIL\n";
echo str_repeat("-", 64) . "\n";

$mailMailer = env('MAIL_MAILER');
if ($mailMailer === 'log') {
    $warnings[] = "MAIL_MAILER = log (emails non envoyés, configurez un vrai SMTP)";
} elseif (empty(env('MAIL_HOST'))) {
    $warnings[] = "MAIL_HOST n'est pas défini";
} else {
    $success[] = "MAIL configuré avec {$mailMailer} ✓";
}

if (empty(env('MAIL_FROM_ADDRESS'))) {
    $warnings[] = "MAIL_FROM_ADDRESS n'est pas défini";
}

echo "\n";

// ============================================
// 4. VÉRIFICATIONS CACHE/SESSIONS
// ============================================

echo "💾 CONFIGURATION CACHE & SESSIONS\n";
echo str_repeat("-", 64) . "\n";

$cacheDriver = env('CACHE_STORE', config('cache.default'));
$sessionDriver = env('SESSION_DRIVER', config('session.driver'));
$queueConnection = env('QUEUE_CONNECTION', config('queue.default'));

if ($cacheDriver === 'file' || $cacheDriver === 'database') {
    $warnings[] = "CACHE_STORE = $cacheDriver (Redis recommandé pour production)";
} else {
    $success[] = "CACHE_STORE = $cacheDriver ✓";
}

if ($sessionDriver === 'file' || $sessionDriver === 'database') {
    $warnings[] = "SESSION_DRIVER = $sessionDriver (Redis recommandé pour production)";
} else {
    $success[] = "SESSION_DRIVER = $sessionDriver ✓";
}

if ($queueConnection === 'sync') {
    $warnings[] = "QUEUE_CONNECTION = sync (database ou redis recommandé)";
}

echo "\n";

// ============================================
// 5. VÉRIFICATIONS FICHIERS
// ============================================

echo "📁 VÉRIFICATIONS FICHIERS & PERMISSIONS\n";
echo str_repeat("-", 64) . "\n";

// Storage link
if (!file_exists(public_path('storage'))) {
    $warnings[] = "Lien symbolique storage manquant (exécutez: php artisan storage:link)";
} else {
    $success[] = "Lien symbolique storage : OK ✓";
}

// Permissions storage
if (!is_writable(storage_path())) {
    $errors[] = "Dossier storage non accessible en écriture";
} else {
    $success[] = "Permissions storage : OK ✓";
}

// Permissions bootstrap/cache
if (!is_writable(base_path('bootstrap/cache'))) {
    $errors[] = "Dossier bootstrap/cache non accessible en écriture";
} else {
    $success[] = "Permissions bootstrap/cache : OK ✓";
}

// .env sécurisé
$envPerms = substr(sprintf('%o', fileperms(base_path('.env'))), -4);
if ($envPerms !== '0600' && $envPerms !== '0400') {
    $warnings[] = ".env a les permissions $envPerms (recommandé: 0600)";
}

echo "\n";

// ============================================
// 6. VÉRIFICATIONS UTILISATEURS
// ============================================

echo "👤 VÉRIFICATIONS UTILISATEURS\n";
echo str_repeat("-", 64) . "\n";

// Comptes de test
$testEmails = ['admin@test.com', 'test@example.com', 'demo@example.com'];
foreach ($testEmails as $email) {
    if (App\Models\User::where('email', $email)->exists()) {
        $warnings[] = "Compte de test trouvé: $email (supprimez en production)";
    }
}

// Vérifier qu'il y a au moins un admin
$adminCount = App\Models\User::whereHas('roles', function($q) {
    $q->where('name', 'Admin');
})->count();

if ($adminCount === 0) {
    $errors[] = "Aucun utilisateur avec le rôle Admin trouvé";
} else {
    $success[] = "Nombre d'administrateurs : $adminCount ✓";
}

echo "\n";

// ============================================
// 7. OPTIMISATIONS
// ============================================

echo "⚡ OPTIMISATIONS\n";
echo str_repeat("-", 64) . "\n";

// Config cached
if (!file_exists(base_path('bootstrap/cache/config.php'))) {
    $warnings[] = "Configuration non mise en cache (exécutez: php artisan config:cache)";
} else {
    $success[] = "Configuration mise en cache ✓";
}

// Routes cached
if (!file_exists(base_path('bootstrap/cache/routes-v7.php'))) {
    $warnings[] = "Routes non mises en cache (exécutez: php artisan route:cache)";
} else {
    $success[] = "Routes mises en cache ✓";
}

// Views compiled
$viewsPath = storage_path('framework/views');
if (count(glob($viewsPath . '/*.php')) === 0) {
    $warnings[] = "Vues non compilées (exécutez: php artisan view:cache)";
} else {
    $success[] = "Vues compilées ✓";
}

echo "\n";

// ============================================
// RÉSUMÉ
// ============================================

echo "\n";
echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║  RÉSUMÉ                                                        ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n";
echo "\n";

echo "✅ Succès : " . count($success) . "\n";
echo "⚠️  Avertissements : " . count($warnings) . "\n";
echo "❌ Erreurs : " . count($errors) . "\n";
echo "\n";

if (count($errors) > 0) {
    echo "❌ ERREURS CRITIQUES :\n";
    echo str_repeat("-", 64) . "\n";
    foreach ($errors as $i => $error) {
        echo ($i + 1) . ". " . $error . "\n";
    }
    echo "\n";
}

if (count($warnings) > 0) {
    echo "⚠️  AVERTISSEMENTS :\n";
    echo str_repeat("-", 64) . "\n";
    foreach ($warnings as $i => $warning) {
        echo ($i + 1) . ". " . $warning . "\n";
    }
    echo "\n";
}

if (count($errors) === 0 && count($warnings) === 0) {
    echo "🎉 FÉLICITATIONS !\n";
    echo "Votre application est correctement configurée pour la production.\n";
    echo "\n";
    exit(0);
} elseif (count($errors) === 0) {
    echo "✅ Configuration valide avec quelques recommandations.\n";
    echo "Consultez les avertissements ci-dessus pour optimiser davantage.\n";
    echo "\n";
    exit(0);
} else {
    echo "⚠️  Des erreurs critiques doivent être corrigées avant le déploiement.\n";
    echo "\n";
    exit(1);
}
