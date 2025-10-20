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
        Schema::table('sells', function (Blueprint $table) {
            // Remove column positioning dependency to avoid failures when column order differs
            $table->unsignedBigInteger('shipping_id')->nullable();
            $table->enum('shipping_status', ['pending', 'in_progress', 'delivered', 'cancelled'])
                  ->default('pending')
                  ->after('shipping_id');
            $table->timestamp('shipped_at')->nullable()->after('shipping_status');
            $table->timestamp('delivered_at')->nullable()->after('shipped_at');
            $table->text('shipping_notes')->nullable()->after('delivered_at');
            
            // Clé étrangère
            $table->foreign('shipping_id')->references('id')->on('shippings')->onDelete('set null');
            
            // Index pour optimiser les requêtes
            $table->index('shipping_status');
            $table->index(['shipping_id', 'shipping_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sells', function (Blueprint $table) {
            $table->dropForeign(['shipping_id']);
            $table->dropIndex(['shipping_id', 'shipping_status']);
            $table->dropIndex(['shipping_status']);
            
            $table->dropColumn([
                'shipping_id',
                'shipping_status', 
                'shipped_at',
                'delivered_at',
                'shipping_notes'
            ]);
        });
    }
};
