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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
			$table->string('name',64);
			$table->string('phone',16);
			$table->string('email',32);
			$table->string('uid',32);
			$table->text('address')->nullable()->default(NULL);
			$table->string('activity')->nullable()->default(NULL);
			$table->string('license_no')->nullable()->default(NULL);
			$table->date('issue_date')->nullable()->default(NULL);
			$table->date('expiry_date')->nullable()->default(NULL);
			$table->string('registration_number')->nullable()->default(NULL);
			$table->json('extra')->nullable()->default(null);
			$table->string('logo',64)->default('demoCompanyLogo.jpeg');
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
        Schema::dropIfExists('companies');
    }
};
