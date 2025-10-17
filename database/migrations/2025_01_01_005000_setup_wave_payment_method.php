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
        // Vérifier si Wave existe déjà
        $waveExists = DB::table('payment_methods')
            ->where('code', 'wave')
            ->exists();

        if (!$waveExists) {
            // Créer la méthode de paiement Wave
            DB::table('payment_methods')->insert([
                'name' => 'Wave',
                'code' => 'wave',
                'description' => 'Paiement mobile via Wave',
                'config' => json_encode([
                    'api_key' => '',
                    'secret_key' => '',
                    'mode' => 'sandbox',
                    'webhook_secret' => ''
                ]),
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            // Mettre à jour la configuration existante si nécessaire
            $currentConfig = DB::table('payment_methods')
                ->where('code', 'wave')
                ->value('config');

            $config = json_decode($currentConfig, true) ?: [];
            
            // Ajouter les nouvelles clés si elles n'existent pas
            $defaultConfig = [
                'api_key' => '',
                'secret_key' => '',
                'mode' => 'sandbox',
                'webhook_secret' => ''
            ];

            $updatedConfig = array_merge($defaultConfig, $config);

            DB::table('payment_methods')
                ->where('code', 'wave')
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
        // Optionnel : supprimer Wave
        // DB::table('payment_methods')->where('code', 'wave')->delete();
    }
};