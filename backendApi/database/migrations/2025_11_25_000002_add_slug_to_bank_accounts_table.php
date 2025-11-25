<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        if (Schema::hasTable('bank_accounts') && !Schema::hasColumn('bank_accounts', 'slug')) {
            Schema::table('bank_accounts', function (Blueprint $table) {
                $table->uuid('slug')->nullable()->after('id');
                $table->index('slug');
            });

            // Backfill slugs for existing rows
            DB::table('bank_accounts')->whereNull('slug')->orderBy('id')->chunkById(500, function ($accounts) {
                foreach ($accounts as $acc) {
                    DB::table('bank_accounts')->where('id', $acc->id)->update(['slug' => (string) Str::uuid()]);
                }
            });

            // Ensure uniqueness by adding a unique constraint if not already present
            // Note: Laravel cannot easily check existing indexes; attempt to add unique.
            Schema::table('bank_accounts', function (Blueprint $table) {
                $table->unique('slug');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        if (Schema::hasTable('bank_accounts') && Schema::hasColumn('bank_accounts', 'slug')) {
            Schema::table('bank_accounts', function (Blueprint $table) {
                // Drop unique and column
                try {
                    $table->dropUnique(['slug']);
                } catch (\Throwable $e) {
                    // ignore if unique index name differs
                }
                $table->dropIndex(['slug']);
                $table->dropColumn('slug');
            });
        }
    }
};

