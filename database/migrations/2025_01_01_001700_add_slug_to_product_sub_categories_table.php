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
        Schema::table('product_sub_categories', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name');
        });

        // Générer les slugs pour les sous-catégories existantes
        DB::table('product_sub_categories')->get()->each(function ($subCategory) {
            $slug = !empty($subCategory->name) ? Str::slug($subCategory->name) : 'sub-category-' . $subCategory->id;
            DB::table('product_sub_categories')
                ->where('id', $subCategory->id)
                ->update(['slug' => $slug]);
        });

        // Rendre la colonne unique après avoir généré tous les slugs
        Schema::table('product_sub_categories', function (Blueprint $table) {
            $table->string('slug')->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_sub_categories', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
