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
        Schema::create('featured_links', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('image')->nullable(); // image peut être optionnelle
            $table->string('link')->nullable();  // lien peut être optionnel
            // Statut actif/inactif
            $table->tinyInteger('is_active')->default(0)->comment('0=Inactive,1=Active');
            // Audit (optionnel si tu veux suivre qui a créé/édité)
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->timestamps();
            $table->softDeletes(); // pour pouvoir supprimer “soft” si besoin
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('featured_links');
    }
};
