<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ajouter les nouveaux settings pour la gestion des pays et TVA
        $settings = [
            [
                'key' => 'default_country',
                'value' => 'Côte D\'Ivoire',
                'group' => 'localization',
                'type' => 'text',
                'label' => 'Pays par défaut',
                'description' => 'Pays par défaut pour les commandes et la livraison'
            ],
            [
                'key' => 'default_country_code',
                'value' => 'CI',
                'group' => 'localization',
                'type' => 'text',
                'label' => 'Code pays par défaut',
                'description' => 'Code ISO du pays par défaut (CI, FR, BE, etc.)'
            ],
            [
                'key' => 'allowed_shipping_countries',
                'value' => 'CI,FR,BE,CH,LU',
                'group' => 'shipping',
                'type' => 'text',
                'label' => 'Pays de livraison autorisés',
                'description' => 'Codes pays séparés par virgule (CI,FR,BE,CH,LU)'
            ],
            [
                'key' => 'international_shipping_enabled',
                'value' => 'true',
                'group' => 'shipping',
                'type' => 'boolean',
                'label' => 'Livraison internationale',
                'description' => 'Autoriser la livraison hors du pays par défaut'
            ],
            [
                'key' => 'tax_calculation_method',
                'value' => 'country_based',
                'group' => 'tax',
                'type' => 'select',
                'label' => 'Méthode de calcul TVA',
                'description' => 'Comment calculer la TVA : country_based, fixed_rate, origin_based'
            ]
        ];

        foreach ($settings as $setting) {
            \DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                $setting + ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \DB::table('settings')->whereIn('key', [
            'default_country',
            'default_country_code',
            'allowed_shipping_countries',
            'international_shipping_enabled',
            'tax_calculation_method'
        ])->delete();
    }
};
