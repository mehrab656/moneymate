<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->uuid('slug')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('account_id')->nullable();
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('refundable_amount', 15, 2)->default(0);
            $table->unsignedBigInteger('category_id')->nullable();
            $table->text('description')->nullable();
            $table->text('note')->nullable();
            $table->string('reference')->nullable();
            $table->date('date')->nullable();
            $table->string('attachment')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};

