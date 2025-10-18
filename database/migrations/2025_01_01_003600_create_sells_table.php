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
        Schema::create('sells', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id'); // Correction: clé étrangère
            $table->string('invoice_id')->nullable();
            $table->tinyInteger('sell_type')->comment('1=pos_sell, 2=ecommerce_sell');
            $table->unsignedBigInteger('sell_by')->nullable(); // Correction: clé étrangère
            $table->unsignedBigInteger('bank_id')->nullable(); // Correction: clé étrangère
            $table->decimal('total_vat_amount', 11, 3)->default(0);
            $table->decimal('shipping_cost', 11, 3)->default(0);
            $table->decimal('total_discount', 11, 3)->default(0);
            $table->decimal('total_payable_amount', 11, 3);
            $table->decimal('total_paid', 11, 2);
            $table->decimal('total_due', 11, 2);
            $table->tinyInteger('payment_type')->comment('0=cash_on_hand, 1=online_pay')->default(0)->nullable();
            $table->tinyInteger('order_status')->comment('0=pending, 1=processing, 2=on_the_way, 3=cancel_request, 4=cancel_accepted, 5=cancel_order_process_completed, 6=order_completed')->nullable();
            $table->timestamp('date')->nullable();
            $table->tinyInteger('status')->comment('0=uncompleted, 1=completed')->default(0);
            $table->timestamps(); // Remplace created_at et updated_at
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->tinyInteger('deleted')->default(0)->comment('0=active, 1=deleted');
            $table->timestamp('deleted_at')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();

            // Foreign keys (à adapter selon tes tables)
            $table->foreign('customer_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('sell_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('bank_id')->references('id')->on('bank_accounts')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sells');
    }
};
