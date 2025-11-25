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
        if (Schema::hasTable('sectors') && !Schema::hasColumn('sectors', 'bank_account_id')) {
            Schema::table('sectors', function (Blueprint $table) {
                // Add nullable to avoid breaking existing records; validation enforces presence on new inserts
                $table->unsignedBigInteger('bank_account_id')->nullable()->after('company_id');
                // No explicit foreign key to match existing style
                $table->index('bank_account_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('sectors') && Schema::hasColumn('sectors', 'bank_account_id')) {
            Schema::table('sectors', function (Blueprint $table) {
                $table->dropIndex(['bank_account_id']);
                $table->dropColumn('bank_account_id');
            });
        }
    }
};

