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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('category_id')->constrained('product_categories')->cascadeOnDelete();
            $table->foreignId('subcategory_id')->nullable()->constrained('product_sub_categories')->nullOnDelete();

            $table->string('image_path')->nullable();
            $table->string('code')->nullable();
            $table->string('color')->nullable();
            $table->string('size')->nullable();
            
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();

            $table->decimal('current_purchase_cost', 11, 3);
            $table->decimal('current_sale_price', 11, 3)->nullable();
            $table->decimal('previous_purchase_cost', 11, 3)->nullable();
            $table->decimal('current_wholesale_price', 11, 3)->nullable();
            $table->decimal('wholesale_minimum_qty', 11, 3)->default(1);
            $table->decimal('previous_wholesale_price', 11, 3)->nullable();
            $table->decimal('previous_sale_price', 11, 3)->nullable();

            $table->decimal('available_quantity', 11, 3)->default(0);

            $table->tinyInteger('discount_type')->default(0)->comment('fixed=0, percentage=1');
            $table->decimal('discount',11,2)->default(0);

            $table->string('unit_type')->nullable()->comment('kg, gm, li');
            $table->text('description')->nullable();

            $table->boolean('is_popular')->default(false);
            $table->boolean('is_trending')->default(false);
            $table->boolean('status')->default(true);

            $table->timestamps(); // created_at, updated_at
            $table->softDeletes(); // deleted_at
            $table->unsignedInteger('created_by')->nullable();
            $table->unsignedInteger('updated_by')->nullable();
            $table->unsignedInteger('deleted_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
