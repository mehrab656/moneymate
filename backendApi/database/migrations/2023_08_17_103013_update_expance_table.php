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
	    Schema::table('expenses', function($table) {
		    $table->double('refundable_amount',10,2)->default(0.00)->after('amount');
		    $table->double('refunded_amount',10,2)->default(0.00)->after('refundable_amount');
	    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
	    Schema::table('expenses', function($table) {
		    $table->dropColumn('refundable_amount');
		    $table->dropColumn('refunded_amount');
	    });
    }
};
