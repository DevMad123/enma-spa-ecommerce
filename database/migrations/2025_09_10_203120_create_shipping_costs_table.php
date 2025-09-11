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
        Schema::create('shipping_costs', function (Blueprint $table) {
            $table->id();
            // Localisation (si tu as déjà des tables divisions/districts, mieux vaut faire des FK)
            $table->unsignedBigInteger('division_id')->nullable();
            $table->unsignedBigInteger('district_id')->nullable();
            // Prix
            $table->decimal('inside_price', 10, 2)->nullable()->default(0);
            $table->decimal('outside_price', 10, 2)->nullable()->default(0);
            // Statut (utile si tu veux activer/désactiver un tarif)
            $table->tinyInteger('status')->default(1)->comment('0=inactive,1=active');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_costs');
    }
};
