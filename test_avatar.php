<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test l'utilisateur avec ID 1
$user = \App\Models\User::find(1);

if ($user) {
    echo "User found: " . $user->name . "\n";
    echo "Avatar field: " . ($user->avatar ?? 'null') . "\n";
    echo "Avatar URL: " . $user->avatar_url . "\n";
    echo "Default Avatar URL: " . $user->default_avatar_url . "\n";
    
    // Vérifier si le fichier avatar existe
    if ($user->avatar) {
        $exists = \Storage::disk('public')->exists($user->avatar);
        echo "Avatar file exists: " . ($exists ? 'YES' : 'NO') . "\n";
        echo "Full storage path: " . storage_path('app/public/' . $user->avatar) . "\n";
    }
} else {
    echo "User not found\n";
}