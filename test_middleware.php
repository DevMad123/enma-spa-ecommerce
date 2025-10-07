<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Simuler la connexion d'un utilisateur
$user = \App\Models\User::find(1);

if ($user) {
    echo "Utilisateur: " . $user->name . "\n";
    echo "Dernière connexion actuelle: " . ($user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'null') . "\n";
    
    // Simuler une authentification
    \Auth::login($user);
    
    // Marquer pour mettre à jour (comme le fait le contrôleur)
    session(['update_last_login' => true]);
    
    echo "Session update_last_login définie: " . (session('update_last_login') ? 'OUI' : 'NON') . "\n";
    
    // Simuler le middleware
    if (\Auth::check() && session('update_last_login', false)) {
        echo "Conditions middleware remplies, mise à jour...\n";
        \Auth::user()->updateLastLogin();
        session()->forget('update_last_login');
        echo "Mise à jour effectuée\n";
    } else {
        echo "Conditions middleware NON remplies\n";
        echo "Auth::check(): " . (\Auth::check() ? 'OUI' : 'NON') . "\n";
        echo "Session update_last_login: " . (session('update_last_login', false) ? 'OUI' : 'NON') . "\n";
    }
    
    // Recharger et vérifier
    $user->refresh();
    echo "Nouvelle dernière connexion: " . ($user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'null') . "\n";
} else {
    echo "Utilisateur non trouvé\n";
}