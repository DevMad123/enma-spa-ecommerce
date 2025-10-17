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
        Schema::create('purchase_details', function (Blueprint $table) {
            $table->id();
            // Relations
            $table->foreignId('purchase_id')->constrained('purchase_product_lists')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            // Coûts
            $table->decimal('unit_cost', 11, 2);
            $table->decimal('total_qty', 11, 2);
            $table->decimal('total_cost', 11, 2);
            $table->decimal('total_vat', 11, 2)->default(0);
            $table->decimal('total_discount', 11, 2)->default(0);
            $table->decimal('purchase_payable_amount', 11, 2)->default(0);
            // Date de la ligne d'achat
            $table->date('date');
            // Statut
            $table->tinyInteger('status')->default(1)->comment('0=inactive,1=active');

            // Audit
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();

            $table->timestamps();
            $table->softDeletes(); // remplace deleted + deleted_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_details');
    }
};
