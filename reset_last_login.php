<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Réinitialiser la dernière connexion pour tous les utilisateurs
\App\Models\User::whereNotNull('last_login_at')->update(['last_login_at' => null]);

echo "Toutes les dernières connexions ont été réinitialisées.\n";
echo "Vous pouvez maintenant vous reconnecter pour tester.\n";