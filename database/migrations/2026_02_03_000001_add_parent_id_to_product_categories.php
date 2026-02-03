<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Ajoute parent_id pour permettre une hiérarchie illimitée de catégories
     */
    public function up(): void
    {
        Schema::table('product_categories', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->after('id')->constrained('product_categories')->nullOnDelete();
            $table->integer('depth')->default(0)->after('parent_id')->comment('Niveau de profondeur: 0=parent, 1=enfant, 2=petit-enfant, etc.');
            $table->string('type')->nullable()->after('depth')->comment('sneakers, streetwear, accessories, etc.');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_categories', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['parent_id', 'depth', 'type']);
        });
    }
};
