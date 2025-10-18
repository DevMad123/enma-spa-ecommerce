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
        Schema::table('products', function (Blueprint $table) {
            // 🔹 Indexation
            $table->index('name');
            $table->index('code');
            $table->index(['category_id', 'subcategory_id']);
            $table->index(['brand_id', 'supplier_id']);

            // 🔹 Rendre le code unique si tu veux éviter les doublons
            $table->unique('code');

            // 🔹 Ajouter les foreign keys pour couleurs et tailles
            $table->foreignId('color_id')->nullable()->constrained('product_colors')->nullOnDelete();
            $table->foreignId('size_id')->nullable()->constrained('product_sizes')->nullOnDelete();

            // 🔹 Supprimer les anciens champs string (si tu n’en as plus besoin)
            $table->dropColumn(['color', 'size']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // rollback : suppression des nouveaux index et colonnes
            $table->dropIndex(['name', 'code']);
            $table->dropIndex(['category_id', 'subcategory_id']);
            $table->dropIndex(['brand_id', 'supplier_id']);
            $table->dropUnique(['code']);

            $table->dropConstrainedForeignId('color_id');
            $table->dropConstrainedForeignId('size_id');

            $table->string('color')->nullable();
            $table->string('size')->nullable();
        });
    }
};
