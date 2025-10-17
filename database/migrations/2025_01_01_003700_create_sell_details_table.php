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
        Schema::create('sell_details', function (Blueprint $table) {
            $table->id();
            // Relations
            $table->unsignedBigInteger('sell_id');
            $table->unsignedBigInteger('product_id');
            // Prix et quantités
            $table->decimal('unit_product_cost', 10, 2)->nullable();
            $table->decimal('unit_sell_price', 10, 2);
            $table->decimal('unit_vat', 10, 2)->default(0);
            $table->decimal('sale_quantity', 10, 2);
            $table->decimal('total_discount', 10, 2)->default(0);
            $table->decimal('total_payable_amount', 12, 2);
            $table->tinyInteger('status')->default(1)->comment('0=inactive,1=active');
            // Audit
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('sell_id')->references('id')->on('sells')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sell_details');
    }
};
