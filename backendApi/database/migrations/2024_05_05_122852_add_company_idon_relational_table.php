<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	/**
	 * Run the migrations.
	 */

	protected array $tables = [
		'activity_logs',
		'bank_accounts',
		'bank_names',
		'borrows',
		'budgets',
		'expenses',
		'incomes',
		'investments',
		'investment_plans',
		'lends',
		'repayments',
		'sectors',
		'wallets',
		'debts',
		'account_transfers',
		'debt_collections',
	];

	public function up(): void {

		foreach ( $this->tables as $tableName ) {
			Schema::table( $tableName, function ( Blueprint $table ) {
				$table->unsignedBigInteger( 'company_id' )->after( 'id' )->default( 1 );
				$table->foreign( 'company_id' )->references( 'id' )->on( 'companies' );
			} );
		}
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void {
		foreach ( $this->tables as $tableName ) {
			Schema::table( $tableName, function ( Blueprint $table ) {
				$table->dropForeign( ['company_id'] );
				$table->dropColumn('company_id');

			} );
		}
	}
};
