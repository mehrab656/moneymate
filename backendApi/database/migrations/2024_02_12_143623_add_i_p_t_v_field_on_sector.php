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
		    $table->string('iptv_mac')->after('el_note')->default(1);
	    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
	    Schema::table('sectors', function($table) {
		    $table->dropColumn( 'iptv_mac' );
	    });
    }
};
