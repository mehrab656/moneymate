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
	    Schema::create('investment_plans', function (Blueprint $table) {
		    $table->id();
		    $table->unsignedBigInteger('added_by');
			$table->string('plan_name');
		    $table->date('plan_created_date');
		    $table->date('plan_start_date');
		    $table->date('plan_end_date');
		    $table->double('amount',10,2)->default(0);
		    $table->double('return_amount',10,2)->default(0);
		    $table->text('note')->nullable()->default(null);
		    $table->timestamps();
	    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
	    Schema::dropIfExists('investment_plans');

    }
};
