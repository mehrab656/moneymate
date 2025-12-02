<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	/**
	 * Run the migrations.
	 */
	public function up(): void {
		if (Schema::hasTable('incomes')) {
			Schema::table('incomes', function (Blueprint $table) {
				$table->string('income_type')->nullable(false)->default('reservation')->after('amount');
				$table->date('checkin_date')->nullable(true)->default(null)->after('income_type');
				$table->date('checkout_date')->nullable(true)->default(null)->after('checkin_date');
			});
		}
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void {
		if (Schema::hasTable('incomes')) {
			Schema::table('incomes', function (Blueprint $table) {
				if (Schema::hasColumn('incomes', 'income_type')) {
					$table->dropColumn('income_type');
				}
				if (Schema::hasColumn('incomes', 'checkin_date')) {
					$table->dropColumn('checkin_date');
				}
				if (Schema::hasColumn('incomes', 'checkout_date')) {
					$table->dropColumn('checkout_date');
				}
			});
		}
	}
};
