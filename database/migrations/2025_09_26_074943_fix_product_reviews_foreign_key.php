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
        Schema::table('product_reviews', function (Blueprint $table) {
            // Supprimer la contrainte existante
            $table->dropForeign(['user_id']);
            
            // Ajouter la nouvelle contrainte vers la table users
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            // Restaurer la contrainte originale
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('ecommerce_customers')->onDelete('cascade');
        });
    }
};
