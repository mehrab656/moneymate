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
        if (Schema::hasTable('investment_plans')) {
            Schema::table('investment_plans', function (Blueprint $table) {
                if (!Schema::hasColumn('investment_plans', 'purposes')) {
                    $table->longText('purposes')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('investment_plans')) {
            Schema::table('investment_plans', function (Blueprint $table) {
                if (Schema::hasColumn('investment_plans', 'purposes')) {
                    $table->dropColumn('purposes');
                }
            });
        }
    }
};

