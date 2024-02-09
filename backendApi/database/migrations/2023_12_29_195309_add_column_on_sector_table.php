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
	    Schema::table('sectors', function($table) {
//		    $table->integer('payment_account_id')->after('name')->default(1);
	    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
	    Schema::table('sectors', function($table) {
		    $table->dropColumn( 'payment_account_id' );
	    });
    }
};
