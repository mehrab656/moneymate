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
        if (Schema::hasTable('repayments')) {
            Schema::table('repayments', function (Blueprint $table) {
                $table->string('note')->after('amount')->default('null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('repayments') && Schema::hasColumn('repayments', 'note')) {
            Schema::table('repayments', function (Blueprint $table) {
                $table->dropColumn('note');
            });
        }
    }
};
