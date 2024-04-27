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
	    Schema::table('repayments', function($table) {
		    $table->string('note')->after('amount')->default('null');
	    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
	    Schema::table( 'repayments', function ( Blueprint $table ) {
		    $table->dropColumn( 'note' );
	    } );
    }
};