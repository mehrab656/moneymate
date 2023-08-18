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
	    Schema::table('investments', function(Blueprint $table) {
		    $table->renameColumn('user_id', 'investor_id');
	    });
	    Schema::table('investments', function(Blueprint $table) {
		    $table->unsignedBigInteger('added_by')->after('investor_id');
	    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
	    Schema::table('investments', function(Blueprint $table) {
		    $table->renameColumn('investor_id', 'user_id');
		    $table->dropColumn('added_by');
	    });
    }
};
