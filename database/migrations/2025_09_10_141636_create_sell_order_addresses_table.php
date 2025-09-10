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
        Schema::create('sell_order_addresses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sell_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->enum('type', ['shipping', 'billing'])->default('shipping');
            // Infos de contact
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            // Adresse
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->string('country')->nullable();
            // Si tu utilises des tables pour division/district
            $table->unsignedBigInteger('division_id')->nullable();
            $table->unsignedBigInteger('district_id')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->softDeletes();
            // Relations
            $table->foreign('sell_id')->references('id')->on('sells')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sell_order_addresses');
    }
};
