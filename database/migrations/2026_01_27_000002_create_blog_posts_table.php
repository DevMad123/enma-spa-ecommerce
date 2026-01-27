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
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt');
            $table->longText('content');
            $table->string('cover_image');
            $table->foreignId('category_id')->nullable()->constrained('blog_categories')->nullOnDelete();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->json('tags')->nullable();
            $table->integer('views')->default(0);
            $table->integer('read_time')->default(5); // Minutes de lecture
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->json('seo_meta')->nullable(); // title, description, keywords
            $table->timestamps();
            $table->softDeletes();

            // Index pour les performances
            $table->index('slug');
            $table->index('published_at');
            $table->index('is_featured');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
