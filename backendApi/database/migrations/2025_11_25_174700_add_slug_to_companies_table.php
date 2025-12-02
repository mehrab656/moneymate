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
    public function up(): void
    {
        // Add slug column if missing
        if (Schema::hasTable('companies') && !Schema::hasColumn('companies', 'slug')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->string('slug')->after('id');
            });

            // Backfill existing rows with unique slugs
            try {
                $companies = DB::table('companies')->select('id')->get();
                foreach ($companies as $company) {
                    DB::table('companies')
                        ->where('id', $company->id)
                        ->update(['slug' => (string) Str::uuid()]);
                }
            } catch (\Throwable $e) {
                // If backfill fails, leave nulls; inserts will set slug anyway
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('companies') && Schema::hasColumn('companies', 'slug')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->dropColumn('slug');
            });
        }
    }
};

