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
        Schema::create('language_settings', function (Blueprint $table) {
            $table->id();
            // Relation utilisateur
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Langue par défaut (ex: en, bn)
            $table->string('default_language', 5);
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
        Schema::dropIfExists('language_settings');
    }
};
