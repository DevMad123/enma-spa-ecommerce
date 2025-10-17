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
        Schema::create('user_shipping_billing_addresses', function (Blueprint $table) {
            $table->id();
            // Relation avec l'utilisateur
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Type d’adresse (shipping ou billing)
            $table->enum('type', ['shipping', 'billing'])->default('shipping');
            // Infos de base
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->string('country')->nullable();
            // Optionnel : pour gérer les divisions/districts (si ton app gère ça)
            $table->unsignedBigInteger('division_id')->nullable();
            $table->unsignedBigInteger('district_id')->nullable();

            // Note libre
            $table->string('note')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_shipping_billing_addresses');
    }
};
