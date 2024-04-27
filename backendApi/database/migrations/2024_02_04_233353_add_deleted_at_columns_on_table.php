<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	/**
	 * Run the migrations.
	 */
	public function up(): void {
		Schema::table( 'bank_accounts', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'bank_names', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'borrows', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'budgets', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'budget_category', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'budget_expenses', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'categories', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'debts', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'debt_collections', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'expenses', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'incomes', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'investments', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'investment_plans', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'investment_purposes', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'lends', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'options', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'payments', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'repayments', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'sectors', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'users', function ( $table ) {
			$table->softDeletes();
		} );
		Schema::table( 'wallets', function ( $table ) {
			$table->softDeletes();
		} );
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void {
		Schema::table( 'bank_accounts', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'bank_names', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'borrows', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'budgets', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'budget_category', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'budget_expenses', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'categories', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'debts', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'debt_collections', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'expenses', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'incomes', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'investments', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'investment_plans', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'investment_purposes', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'lends', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'options', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'payments', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'repayments', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'sectors', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'users', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
		Schema::table( 'wallets', function ( $table ) {
			$table->dropColumn('deleted_at');
		} );
	}
};
