<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('budgets')) {
            Schema::table('budgets', function (Blueprint $table) {
                if (!Schema::hasColumn('budgets', 'budget_name')) {
                    $table->string('budget_name')->nullable()->after('id');
                }
                if (!Schema::hasColumn('budgets', 'updated_amount')) {
                    $table->decimal('updated_amount', 15, 2)->default(0)->after('amount');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('budgets')) {
            Schema::table('budgets', function (Blueprint $table) {
                if (Schema::hasColumn('budgets', 'budget_name')) {
                    $table->dropColumn('budget_name');
                }
                if (Schema::hasColumn('budgets', 'updated_amount')) {
                    $table->dropColumn('updated_amount');
                }
            });
        }
    }
};

