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
        if (Schema::hasTable('activity_logs')) {
            Schema::table('activity_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('activity_logs', 'company_id')) {
                    $table->unsignedBigInteger('company_id')->nullable()->after('id');
                }
                if (!Schema::hasColumn('activity_logs', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('activity_logs')) {
            Schema::table('activity_logs', function (Blueprint $table) {
                if (Schema::hasColumn('activity_logs', 'company_id')) {
                    $table->dropColumn('company_id');
                }
                if (Schema::hasColumn('activity_logs', 'deleted_at')) {
                    $table->dropColumn('deleted_at');
                }
            });
        }
    }
};

