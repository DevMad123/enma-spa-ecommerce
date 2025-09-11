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
        Schema::create('money_transactions', function (Blueprint $table) {
            $table->id();
            // type de transaction
            $table->enum('transaction_type', ['in', 'out']); 
            // relation polymorphique (purchase, sell, expense...)
            $table->morphs('transactionable'); // crée transactionable_id + transactionable_type
            $table->decimal('total_amount', 15, 2)->default(0);
            // lien avec un compte bancaire
            $table->foreignId('bank_account_id')->nullable()->constrained('bank_accounts')->onDelete('set null');
            $table->text('description')->nullable();
            $table->boolean('is_invest')->default(0)->comment('1=yes,0=no');
            $table->date('date');
            $table->tinyInteger('status')->default(1)->comment('0=inactive,1=active');
            // audit
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
        Schema::dropIfExists('money_transactions');
    }
};
