<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	/**
	 * Run the migrations.
	 */
	public function up(): void {
		Schema::table( 'activity_logs', function ( Blueprint $table ) {
//			$table->string( 'object' )->nullable( true )->default( null )->after( 'object_id' );
			$table->boolean( 'view_status' )->default( false )->after( 'descriptions' );
			$table->json( 'view_by' )->nullable( true )->default( null )->after( 'view_status' );
		} );
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void {
		Schema::table('activity_logs',function (Blueprint $table){
			$table->dropColumn('object');
			$table->dropColumn('view_status');
			$table->dropColumn('view_by');
		});
	}
};
