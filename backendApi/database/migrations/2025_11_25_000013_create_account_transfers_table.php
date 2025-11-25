<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('account_transfers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('from_account_id');
            $table->unsignedBigInteger('to_account_id');
            $table->decimal('amount', 15, 2);
            $table->date('transfer_date');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('from_account_id')->references('id')->on('bank_accounts')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('to_account_id')->references('id')->on('bank_accounts')->onDelete('cascade')->onUpdate('cascade');

            $table->index(['user_id']);
            $table->index(['from_account_id']);
            $table->index(['to_account_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_transfers');
    }
};

