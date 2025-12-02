<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        if (!Schema::hasTable('bank_names')) {
            Schema::create('bank_names', function (Blueprint $table) {
                $table->id();
                // Company and user context
                $table->unsignedBigInteger('company_id')->default(1);
                $table->unsignedBigInteger('user_id');

                // Bank name
                $table->string('bank_name');

                // Common columns
                $table->timestamps();
                $table->softDeletes();

                // Indexes and constraints
                $table->index('company_id');
                $table->index('user_id');
                $table->unique(['company_id', 'user_id', 'bank_name'], 'uniq_company_user_bank_name');

                // If companies/users tables exist, you may enable FKs later
                // $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                // $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        if (Schema::hasTable('bank_names')) {
            Schema::dropIfExists('bank_names');
        }
    }
};

