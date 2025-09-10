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
        Schema::create('product_sub_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('category_id')->constrained('product_categories')->cascadeOnDelete();

            $table->string('image')->nullable();
            $table->string('note')->nullable();

            $table->boolean('status')->default(true)->comment('0=inactive,1=active');

            $table->timestamps();       // created_at, updated_at
            $table->softDeletes();      // deleted_at
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
        Schema::dropIfExists('product_sub_categories');
    }
};
