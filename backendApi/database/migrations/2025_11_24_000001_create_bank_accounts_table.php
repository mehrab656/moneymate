<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->uuid('slug');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('bank_name_id')->nullable();
            $table->string('account_name');
            $table->string('account_number')->nullable();
            $table->decimal('balance', 15, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->index('slug');
            $table->unique('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};
