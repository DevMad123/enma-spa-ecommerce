<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('front_customizations', function (Blueprint $table) {
            if (!Schema::hasColumn('front_customizations', 'featured_category_id')) {
                $table->foreignId('featured_category_id')
                    ->nullable()
                    ->after('featured_section_enabled')
                    ->constrained('product_categories')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('front_customizations', function (Blueprint $table) {
            if (Schema::hasColumn('front_customizations', 'featured_category_id')) {
                $table->dropConstrainedForeignId('featured_category_id');
            }
        });
    }
};

