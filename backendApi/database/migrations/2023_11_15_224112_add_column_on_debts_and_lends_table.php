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
		if (Schema::hasTable('lends')) {
			Schema::table('lends', function (Blueprint $table) {
				$table->string('note')->after('amount')->default('null');
			});
		}
		if (Schema::hasTable('borrows')) {
			Schema::table('borrows', function (Blueprint $table) {
				$table->string('note')->after('amount')->default('null');
			});
		}
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void {
		if (Schema::hasTable('lends') && Schema::hasColumn('lends', 'note')) {
			Schema::table('lends', function (Blueprint $table) {
				$table->dropColumn('note');
			});
		}
		if (Schema::hasTable('borrows') && Schema::hasColumn('borrows', 'note')) {
			Schema::table('borrows', function (Blueprint $table) {
				$table->dropColumn('note');
			});
		}
	}
};
