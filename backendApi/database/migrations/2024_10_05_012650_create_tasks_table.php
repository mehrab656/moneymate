<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('employee_id');
            $table->text('description')->nullable(false);
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('type');
            $table->double('amount')->default(0);
            $table->double('paid')->default(0);
            $table->string('status')->default('pending')->comment('pending/hold/done/cancelled');
            $table->string('payment_status')->default('pending');
            $table->json('workflow')->nullable(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
