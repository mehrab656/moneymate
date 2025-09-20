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
        Schema::create('task_employee', function (Blueprint $table) {
            $table->id();
            $table->string('task_id');
            $table->string('employee_id');
            $table->time('started_at')->nullable()->default(null);
            $table->time('ended_at')->nullable()->default(null);
            $table->text('status')->nullable(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_employee');

    }
};
