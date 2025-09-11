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
        Schema::create('ecommerce_customers', function (Blueprint $table) {
            $table->id();
            // Informations personnelles
            $table->string('first_name');
            $table->string('last_name');
            $table->string('image')->nullable();
            $table->string('email')->unique(); // éviter doublons
            $table->string('phone_one')->nullable();
            $table->string('phone_two')->nullable();
            $table->text('present_address')->nullable();
            $table->text('permanent_address')->nullable();
            // Auth
            $table->string('password');

            // Statut
            $table->tinyInteger('status')->default(1)->comment('0=inactive,1=active');

            // Audit
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();

            $table->timestamps();
            $table->softDeletes(); // remplace deleted + deleted_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ecommerce_customers');
    }
};
