<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	/**
	 * Run the migrations.
	 */
	public function up(): void {
		Schema::table( 'incomes', function ( Blueprint $table ) {
			$table->string( 'income_type' )->nullable( false )->default( 'reservation' )->after( 'amount' );
			$table->date( 'checkin_date' )->nullable( true )->default( null )->after( 'income_type' );
			$table->date( 'checkout_date' )->nullable( true )->default( null )->after( 'checkin_date' );

		} );
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void {
		Schema::table( 'incomes', function ( Blueprint $table ) {
			$table->dropColumn( 'income_type' );
			$table->dropColumn( 'checkin_date' );
			$table->dropColumn( 'checkout_date' );
		} );
	}
};
