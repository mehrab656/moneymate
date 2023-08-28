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
	    Schema::create('investment_purposes', function (Blueprint $table) {
		    $table->id();
		    $table->unsignedBigInteger('plan_id');
		    $table->string('purpose');
		    $table->integer('payment_terms')->default(1);
		    $table->double('amount',10,2)->default(0);
		    $table->double('refundable_amount',10,2)->default(0);
		    $table->string('remarks')->default('N\A');
		    $table->timestamps();
	    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investment_purposes');
    }
};
