<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	/**
	 * Run the migrations.
	 */
	public function up(): void {
		Schema::create( 'channels', function ( Blueprint $table ) {
			$table->id();
			$table->unsignedBigInteger( 'sector_id' );
			$table->foreign( 'sector_id' )->references( 'id' )->on( 'sectors' );
			$table->string( 'channel_name' )->default( null )->default( null );
			$table->string( 'reference_id' )->nullable()->default( null );
			$table->date( 'listing_date' )->nullable()->default( null );
			$table->timestamps();
		} );
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void {
		Schema::dropIfExists('channels');
	}
};
