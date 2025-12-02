<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('investments', function (Blueprint $table) {
            if (!Schema::hasColumn('investments', 'slug')) {
                $table->string('slug')->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('investments', 'company_id')) {
                $table->unsignedBigInteger('company_id')->nullable()->after('added_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('investments', function (Blueprint $table) {
            if (Schema::hasColumn('investments', 'slug')) {
                $table->dropColumn('slug');
            }
            if (Schema::hasColumn('investments', 'company_id')) {
                $table->dropColumn('company_id');
            }
        });
    }
};

