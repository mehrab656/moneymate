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
        if (Schema::hasTable('expenses')) {
            Schema::table('expenses', function (Blueprint $table) {
                if (!Schema::hasColumn('expenses', 'refundable_amount')) {
                    $table->double('refundable_amount', 10, 2)->default(0.00)->after('amount');
                }
                if (!Schema::hasColumn('expenses', 'refunded_amount')) {
                    $table->double('refunded_amount', 10, 2)->default(0.00)->after('refundable_amount');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('expenses')) {
            Schema::table('expenses', function (Blueprint $table) {
                if (Schema::hasColumn('expenses', 'refundable_amount')) {
                    $table->dropColumn('refundable_amount');
                }
                if (Schema::hasColumn('expenses', 'refunded_amount')) {
                    $table->dropColumn('refunded_amount');
                }
            });
        }
    }
};

