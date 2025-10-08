<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Setting;

echo "=== Vérification de la devise dans les paramètres ===\n";

try {
    // Vérifier s'il y a déjà une devise configurée
    $currency = Setting::get('currency');
    
    if ($currency) {
        echo "✅ Devise configurée: {$currency}\n";
    } else {
        echo "❌ Aucune devise configurée.\n";
        echo "Création d'une devise par défaut: XOF\n";
        
        Setting::set('currency', 'XOF', 'string');
        Setting::set('currency_symbol', 'XOF', 'string');
        Setting::set('currency_position', 'after', 'string'); // before ou after
        
        echo "✅ Devise par défaut créée: XOF\n";
    }
    
    // Afficher tous les paramètres liés à la devise
    echo "\nParamètres de devise existants:\n";
    $currencySettings = Setting::where('key', 'LIKE', 'currency%')->get();
    
    foreach ($currencySettings as $setting) {
        echo "  {$setting->key}: {$setting->value} (type: {$setting->type})\n";
    }
    
    if ($currencySettings->isEmpty()) {
        echo "  Aucun paramètre de devise trouvé.\n";
    }

} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}