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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
			$table->unsignedBigInteger('company_id');
			$table->string('role',16);
			$table->boolean('status');
			$table->json('permissions');
			$table->json('options')->nullable()->default(NULL);
	        $table->unsignedBigInteger('created_by');
	        $table->unsignedBigInteger('updated_by');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
