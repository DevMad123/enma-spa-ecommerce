<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('product_categories', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name');
        });

        // Générer les slugs pour les catégories existantes
        DB::table('product_categories')->get()->each(function ($category) {
            $slug = !empty($category->name) ? Str::slug($category->name) : 'category-' . $category->id;
            DB::table('product_categories')
                ->where('id', $category->id)
                ->update(['slug' => $slug]);
        });

        // Rendre la colonne unique après avoir généré tous les slugs
        Schema::table('product_categories', function (Blueprint $table) {
            $table->string('slug')->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_categories', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
