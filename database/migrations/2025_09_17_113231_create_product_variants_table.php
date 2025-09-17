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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('color_id')->nullable()->constrained('product_colors')->nullOnDelete();
            $table->foreignId('size_id')->nullable()->constrained('product_sizes')->nullOnDelete();

            $table->string('sku')->unique(); // SKU de la variante (ex: PS5-BLANC-500GB)
            $table->decimal('purchase_cost', 11, 3);
            $table->decimal('sale_price', 11, 3)->nullable();
            $table->decimal('wholesale_price', 11, 3)->nullable();
            $table->decimal('available_quantity', 11, 3)->default(0);

            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
