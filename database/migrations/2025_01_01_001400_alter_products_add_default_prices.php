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
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('current_purchase_cost', 10, 2)->default(0)->change();
            $table->decimal('current_sale_price', 10, 2)->default(0)->change();
            $table->decimal('current_wholesale_price', 10, 2)->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('current_purchase_cost', 10, 2)->nullable(false)->change();
            $table->decimal('current_sale_price', 10, 2)->nullable(false)->change();
            $table->decimal('current_wholesale_price', 10, 2)->nullable(false)->change();
        });
    }
};
