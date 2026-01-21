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
        // D'abord, mettre à jour les valeurs NULL
        DB::statement("
            UPDATE product_variants 
            SET wholesale_price = COALESCE(sale_price, 0)
            WHERE wholesale_price IS NULL
        ");
        
        // Ensuite, s'assurer que wholesale_price a une valeur par défaut
        Schema::table('product_variants', function (Blueprint $table) {
            $table->decimal('wholesale_price', 11, 3)->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->decimal('wholesale_price', 11, 3)->nullable()->change();
        });
    }
};
