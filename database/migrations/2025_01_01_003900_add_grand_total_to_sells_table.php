<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sells', function (Blueprint $table) {
            // Ajouter grand_total comme copie de total_payable_amount pour compatibilité
            $table->decimal('grand_total', 11, 3)->default(0)->after('total_payable_amount');
        });
        
        // Copier les valeurs existantes
        DB::statement('UPDATE sells SET grand_total = total_payable_amount');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sells', function (Blueprint $table) {
            $table->dropColumn('grand_total');
        });
    }
};
