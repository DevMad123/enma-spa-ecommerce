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
            // Ajouter les champs manquants pour l'e-commerce
            $table->string('order_reference')->unique()->after('id')->nullable();
            $table->tinyInteger('payment_status')->comment('0=unpaid, 1=paid, 2=partial, 3=refunded')->default(0)->after('payment_type');
            $table->string('shipping_method')->nullable()->after('shipping_cost');
            $table->text('notes')->nullable()->after('order_status');
            
            // Corriger la foreign key pour customer_id (pointer vers ecommerce_customers au lieu de users)
            $table->dropForeign(['customer_id']);
            $table->foreign('customer_id')->references('id')->on('ecommerce_customers')->onDelete('cascade');
        });

        // Ajouter product_variant_id à sell_details
        Schema::table('sell_details', function (Blueprint $table) {
            $table->unsignedBigInteger('product_variant_id')->nullable()->after('product_id');
            
            // Ajouter la foreign key pour product_variant_id
            $table->foreign('product_variant_id')->references('id')->on('product_variants')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sells', function (Blueprint $table) {
            $table->dropColumn(['order_reference', 'payment_status', 'shipping_method', 'notes']);
            
            // Remettre la foreign key originale
            $table->dropForeign(['customer_id']);
            $table->foreign('customer_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('sell_details', function (Blueprint $table) {
            $table->dropForeign(['product_variant_id']);
            $table->dropColumn('product_variant_id');
        });
    }
};
