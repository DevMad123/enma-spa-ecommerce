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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('supplier_name');
            $table->string('image')->nullable();
            $table->string('supplier_phone_one');
            $table->string('supplier_phone_two')->nullable();
            $table->string('company_name')->nullable();
            $table->string('company_address')->nullable();
            $table->string('supplier_address')->nullable();
            $table->string('company_email')->nullable();
            $table->string('company_phone')->nullable();
            $table->string('supplier_email')->nullable();
            $table->decimal('previous_due',11,3)->nullable();
            $table->boolean('status')->default(true)->comment('0=inactive,1=active');

            $table->timestamps();
            $table->softDeletes();     // deleted_at
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
        Schema::dropIfExists('suppliers');
    }
};
