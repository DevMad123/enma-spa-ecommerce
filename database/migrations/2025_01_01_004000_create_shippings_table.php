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
        Schema::create('shippings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('Nom du mode de livraison');
            $table->decimal('price', 11, 2)->default(0)->comment('Prix de la livraison');
            $table->text('description')->nullable()->comment('Description du mode de livraison');
            $table->boolean('is_active')->default(true)->comment('Mode de livraison actif');
            $table->integer('sort_order')->default(0)->comment('Ordre d\'affichage');
            $table->integer('estimated_days')->nullable()->comment('Délai estimé en jours');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['is_active', 'sort_order']);
            $table->index('name');
            
            // Contraintes de clés étrangères
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shippings');
    }
};
