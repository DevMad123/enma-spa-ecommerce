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
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            // relation avec products
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('image'); // chemin de l’image (ex: storage/product/xxx.jpg)

            $table->boolean('status')->default(true)->comment("active=1,inactive=0");

            $table->timestamps();       // created_at, updated_at
            $table->softDeletes();      // deleted_at
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
        Schema::dropIfExists('product_images');
    }
};
