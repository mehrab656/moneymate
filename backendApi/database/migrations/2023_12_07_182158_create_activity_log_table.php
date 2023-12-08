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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
	        $table->unsignedBigInteger('user_id');
	        $table->ipAddress()->nullable()->default(null);
	        $table->string('log_ype')->comment('modify,delete,create');
	        $table->json('data_records')->comment('store previous records and other associative information');
	        $table->text('descriptions')->comment('log descriptions');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
