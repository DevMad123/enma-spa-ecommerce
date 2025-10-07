<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test de la méthode updateLastLogin
$user = \App\Models\User::find(1);

if ($user) {
    echo "Utilisateur trouvé: " . $user->name . "\n";
    echo "Dernière connexion avant: " . ($user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'null') . "\n";
    
    // Simuler la mise à jour
    $user->updateLastLogin();
    
    // Recharger l'utilisateur
    $user->refresh();
    
    echo "Dernière connexion après: " . ($user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'null') . "\n";
} else {
    echo "Utilisateur non trouvé\n";
}