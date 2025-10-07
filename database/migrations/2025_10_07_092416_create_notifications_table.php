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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'contact_message', 'new_order', 'new_user'
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Données supplémentaires
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // Admin concerné
            $table->timestamp('read_at')->nullable();
            $table->string('action_url')->nullable(); // URL vers la ressource concernée
            $table->string('icon')->nullable(); // Icône pour l'affichage
            $table->string('color')->default('blue'); // Couleur du badge
            $table->timestamps();
            
            $table->index(['user_id', 'read_at']);
            $table->index(['type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
