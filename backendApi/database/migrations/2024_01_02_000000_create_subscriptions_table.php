<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('subscriptions')) {
            Schema::create('subscriptions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('status')->default('active');
                $table->date('current_period_start')->nullable();
                $table->date('current_period_end')->nullable();
                $table->string('plan')->nullable();
                $table->string('product_id')->nullable();
                $table->string('price_id')->nullable();
                $table->decimal('amount', 10, 2)->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index('user_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('subscriptions')) {
            Schema::dropIfExists('subscriptions');
        }
    }
};

