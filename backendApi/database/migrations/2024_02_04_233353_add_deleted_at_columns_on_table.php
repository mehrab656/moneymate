<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	/**
	 * Run the migrations.
	 */
	public function up(): void {
		$tables = [
			'bank_accounts','bank_names','borrows','budgets','budget_category','budget_expenses',
			'categories','debts','debt_collections','expenses','incomes','investments',
			'investment_plans','investment_purposes','lends','options','payments','repayments',
			'sectors','users','wallets',
		];
		foreach ($tables as $tableName) {
			if (Schema::hasTable($tableName) && !Schema::hasColumn($tableName, 'deleted_at')) {
				Schema::table($tableName, function (Blueprint $table) {
					$table->softDeletes();
				});
			}
		}
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void {
		$tables = [
			'bank_accounts','bank_names','borrows','budgets','budget_category','budget_expenses',
			'categories','debts','debt_collections','expenses','incomes','investments',
			'investment_plans','investment_purposes','lends','options','payments','repayments',
			'sectors','users','wallets',
		];
		foreach ($tables as $tableName) {
			if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'deleted_at')) {
				Schema::table($tableName, function (Blueprint $table) {
					$table->dropColumn('deleted_at');
				});
			}
		}
	}
};
