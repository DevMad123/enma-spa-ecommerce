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
        Schema::create('payment_infos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sell_id');
            $table->enum('payment_type', ['card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'wallet'])
                ->default('card');
            $table->decimal('total_paid', 10, 2);
            $table->string('tnx_id', 100)->unique()->comment('ID de transaction du prestataire');
            $table->string('card_brand', 50)->nullable();
            $table->string('card_last_digit', 4)->nullable();
            $table->string('payment_inv_link')->nullable()->comment('Lien vers facture/preuve du prestataire');
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->timestamps();
            $table->softDeletes();
            $table->foreign('sell_id')->references('id')->on('sells')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_infos');
    }
};
