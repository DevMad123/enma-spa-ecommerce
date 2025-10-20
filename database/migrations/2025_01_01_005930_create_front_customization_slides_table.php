<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('front_customization_slides', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('background_image')->nullable();
            $table->string('tagline')->nullable();
            $table->unsignedTinyInteger('order')->default(1);
            $table->boolean('enabled')->default(true);
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
            $table->index(['enabled', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('front_customization_slides');
    }
};

