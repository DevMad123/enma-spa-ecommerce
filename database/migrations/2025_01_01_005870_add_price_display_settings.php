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
        // Ajouter les paramètres d'affichage des prix
        $settings = [
            [
                'key' => 'show_decimals',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'pricing',
                'label' => 'Afficher les décimales'
            ],
            [
                'key' => 'tax_rate',
                'value' => '0.18',
                'type' => 'float',
                'group' => 'pricing',
                'label' => 'Taux de TVA'
            ],
            [
                'key' => 'shipping_threshold',
                'value' => '50000',
                'type' => 'float',
                'group' => 'shipping',
                'label' => 'Seuil livraison gratuite'
            ],
            [
                'key' => 'shipping_cost',
                'value' => '3000',
                'type' => 'float',
                'group' => 'shipping',
                'label' => 'Coût de livraison'
            ],
            [
                'key' => 'free_shipping_threshold',
                'value' => '75000',
                'type' => 'float',
                'group' => 'shipping',
                'label' => 'Seuil global livraison gratuite'
            ],
            [
                'key' => 'max_price_default',
                'value' => '5000000',
                'type' => 'float',
                'group' => 'pricing',
                'label' => 'Prix maximum par défaut'
            ]
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Supprimer les paramètres ajoutés
        $keys = [
            'show_decimals',
            'tax_rate', 
            'shipping_threshold',
            'shipping_cost',
            'max_price_default'
        ];

        Setting::whereIn('key', $keys)->delete();
    }
};
