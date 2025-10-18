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
        Schema::create('offer_product_lists', function (Blueprint $table) {
            $table->id();
            // Relations
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('offer_id')->constrained()->onDelete('cascade');
            // Restrictions & suivi
            $table->unsignedInteger('max_quantity')->default(0);
            $table->unsignedInteger('total_sell_quantity')->nullable();
            // Type et valeur de l’offre
            $table->enum('offer_type', ['fixed', 'percentage'])->default('fixed');
            $table->decimal('offer_amount', 11, 2);
            // Statut
            $table->boolean('status')->default(1)->comment('0=inactive,1=active');
            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('deleted_by')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offer_product_lists');
    }
};
