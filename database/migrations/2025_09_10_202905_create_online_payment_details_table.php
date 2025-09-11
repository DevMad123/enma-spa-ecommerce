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
        Schema::create('online_payment_details', function (Blueprint $table) {
            $table->id();
            // Relations
            $table->foreignId('sell_id')->constrained('sells')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');

            // Paiement
            $table->decimal('total_amount', 11, 2);
            $table->enum('pay_with', ['card', 'paypal', 'stripe', 'mobile_money', 'bank_transfer'])->nullable();
            $table->string('transaction_id')->nullable()->unique();

            // Suivi du statut
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('online_payment_details');
    }
};
