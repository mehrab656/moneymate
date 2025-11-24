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
        if (Schema::hasTable('debt_collections')) {
            Schema::table('debt_collections', function (Blueprint $table) {
                $table->string('note')->after('amount')->default('null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
	    if (Schema::hasTable('debt_collections') && Schema::hasColumn('debt_collections', 'note')) {
            Schema::table('debt_collections', function (Blueprint $table) {
                $table->dropColumn('note');
            });
        }
	}
};
