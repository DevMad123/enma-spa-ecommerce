<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Vérifier si Orange Money existe déjà
        $orangeMoneyExists = DB::table('payment_methods')
            ->where('code', 'orange_money')
            ->exists();

        if (!$orangeMoneyExists) {
            // Créer la méthode de paiement Orange Money
            DB::table('payment_methods')->insert([
                'name' => 'Orange Money',
                'code' => 'orange_money',
                'description' => 'Paiement mobile via Orange Money',
                'config' => json_encode([
                    'client_id' => '',
                    'client_secret' => '',
                    'merchant_key' => '',
                    'mode' => 'sandbox',
                    'webhook_secret' => ''
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            // Mettre à jour la configuration existante si nécessaire
            $currentConfig = DB::table('payment_methods')
                ->where('code', 'orange_money')
                ->value('config');

            $config = json_decode($currentConfig, true) ?: [];
            
            // Ajouter les nouvelles clés si elles n'existent pas
            $defaultConfig = [
                'client_id' => '',
                'client_secret' => '',
                'merchant_key' => '',
                'mode' => 'sandbox',
                'webhook_secret' => ''
            ];

            $updatedConfig = array_merge($defaultConfig, $config);

            DB::table('payment_methods')
                ->where('code', 'orange_money')
                ->update([
                    'config' => json_encode($updatedConfig),
                    'updated_at' => now(),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Optionnel : supprimer Orange Money
        // DB::table('payment_methods')->where('code', 'orange_money')->delete();
    }
};
