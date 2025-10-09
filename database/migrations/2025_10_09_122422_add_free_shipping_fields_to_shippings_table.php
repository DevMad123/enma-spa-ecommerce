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
        Schema::table('shippings', function (Blueprint $table) {
            $table->boolean('supports_free_shipping')->default(false)->after('price');
            $table->decimal('free_shipping_threshold', 10, 2)->nullable()->after('supports_free_shipping');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shippings', function (Blueprint $table) {
            $table->dropColumn(['supports_free_shipping', 'free_shipping_threshold']);
        });
    }
};
