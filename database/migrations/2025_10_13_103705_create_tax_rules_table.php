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
        Schema::create('tax_rules', function (Blueprint $table) {
            $table->id();
            $table->string('country_code', 2)->unique(); // Code ISO 3166-1 alpha-2 (FR, BE, etc.)
            $table->string('country_name'); // Nom du pays (France, Belgique, etc.)
            $table->decimal('tax_rate', 8, 4)->default(0); // Taux de TVA (0.2000 = 20%)
            $table->boolean('is_default')->default(false); // Pays par défaut
            $table->boolean('delivery_allowed')->default(true); // Livraison autorisée
            $table->boolean('is_active')->default(true); // Règle active
            $table->json('delivery_zones')->nullable(); // Zones de livraison spécifiques (optionnel)
            $table->decimal('min_order_amount', 10, 2)->nullable(); // Montant minimum de commande
            $table->text('notes')->nullable(); // Notes administratives
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['country_code', 'is_active']);
            $table->index('is_default');
            $table->index('delivery_allowed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_rules');
    }
};
