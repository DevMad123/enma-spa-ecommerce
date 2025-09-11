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
        Schema::create('purchase_product_lists', function (Blueprint $table) {
            $table->id();
            // Montants financiers
            $table->decimal('total_cost', 12, 2);
            $table->decimal('total_vat', 12, 2)->default(0);
            $table->decimal('total_discount', 12, 2)->default(0);
            $table->decimal('total_payable_amount', 12, 2);
            $table->decimal('total_paid', 12, 2);
            $table->decimal('total_due', 12, 2);
            // Références
            $table->string('purchase_code')->nullable();
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
            // Date de la commande
            $table->timestamp('date')->useCurrent();
            // Statut
            $table->tinyInteger('status')->default(1)->comment('0=inactive,1=active');
            // Audit
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_product_lists');
    }
};
