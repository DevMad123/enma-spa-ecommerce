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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sell_id')->constrained('sells')->onDelete('cascade');
            $table->foreignId('payment_method_id')->constrained('payment_methods')->onDelete('cascade');
            $table->string('transaction_id')->unique(); // ID de la transaction PayPal
            $table->string('payment_id')->nullable(); // ID du paiement PayPal
            $table->string('payer_id')->nullable(); // ID du payeur PayPal
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('XOF');
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled', 'refunded'])->default('pending');
            $table->enum('type', ['payment', 'refund'])->default('payment');
            $table->json('gateway_response')->nullable(); // Réponse complète de PayPal
            $table->json('metadata')->nullable(); // Métadonnées supplémentaires
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            // Index pour les recherches fréquentes
            $table->index(['status']);
            $table->index(['type']);
            $table->index(['sell_id', 'status']);
            $table->index(['payment_method_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
