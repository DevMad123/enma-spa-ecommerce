<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('front_customizations', function (Blueprint $table) {
            $table->id();
            $table->boolean('hero_enabled')->default(false);
            $table->foreignId('hero_product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('hero_background_image')->nullable();
            $table->string('hero_title')->nullable();
            $table->string('hero_subtitle')->nullable();
            $table->boolean('featured_section_enabled')->default(true);
            $table->boolean('newsletter_enabled')->default(true);
            $table->string('theme_color')->nullable();
            $table->string('logo_image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('front_customizations');
    }
};

