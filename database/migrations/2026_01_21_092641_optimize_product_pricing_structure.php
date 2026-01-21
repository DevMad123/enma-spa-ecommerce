<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Ajouter des index pour optimiser les performances
            $table->index(['status', 'is_popular']);
            $table->index(['status', 'is_trending']);
            $table->index(['category_id', 'status']);
            $table->index(['brand_id', 'status']);
            
            // Ajouter une colonne pour le prix calculé final (avec réductions)
            $table->decimal('calculated_final_price', 11, 3)->nullable()->after('discount');
            
            // S'assurer que discount_type a les bonnes valeurs par défaut
            $table->tinyInteger('discount_type')->default(0)->change();
            $table->decimal('discount', 11, 3)->default(0)->change();
        });
        
        // Mettre à jour les prix calculés pour les produits existants
        DB::statement("
            UPDATE products 
            SET calculated_final_price = CASE 
                WHEN discount_type = 1 THEN current_sale_price - (current_sale_price * (discount / 100))
                WHEN discount_type = 0 THEN current_sale_price - discount
                ELSE current_sale_price
            END
            WHERE current_sale_price IS NOT NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Supprimer les index
            $table->dropIndex(['status', 'is_popular']);
            $table->dropIndex(['status', 'is_trending']);  
            $table->dropIndex(['category_id', 'status']);
            $table->dropIndex(['brand_id', 'status']);
            
            // Supprimer la colonne calculée
            $table->dropColumn('calculated_final_price');
        });
    }
};
