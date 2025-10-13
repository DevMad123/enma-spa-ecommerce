<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Setting;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Supprimer les paramètres de TVA obsolètes des settings
        $taxSettings = [
            'tax_rate',
            'tax_calculation_method',
            'allowed_shipping_countries',
            'international_shipping_enabled'
        ];
        
        foreach ($taxSettings as $key) {
            Setting::where('key', $key)->delete();
        }
        
        // Message informatif
        echo "✅ Paramètres de TVA supprimés des settings. Utiliser les TaxRules maintenant.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Ne pas recréer les anciens paramètres car ils sont maintenant dans TaxRules
        echo "ℹ️  Les paramètres de TVA ne sont pas restaurés. Utilisez TaxRules.\n";
    }
};
