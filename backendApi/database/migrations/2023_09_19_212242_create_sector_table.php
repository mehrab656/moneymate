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
        Schema::create('sectors', function (Blueprint $table) {
            $table->id();
	        $table->string('name');
	        $table->date('contract_start_date');
	        $table->date('contract_end_date');
	        $table->bigInteger('el_premises_no')->nullable(true);
	        $table->bigInteger('el_acc_no')->nullable(true);
	        $table->bigInteger('el_business_acc_no')->nullable(true);
	        $table->date('el_billing_date')->nullable(true);
	        $table->text('el_note')->default(null);
	        $table->string('internet_acc_no')->nullable(true)->nullable(true);
	        $table->date('internet_billing_date')->nullable(true);
	        $table->text('int_note')->nullable(true)->default(null);
	        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sectors');
    }
};
