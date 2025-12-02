<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Create table if it doesn't exist
        if (!Schema::hasTable('budget_expenses')) {
            Schema::create('budget_expenses', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->unsignedBigInteger('company_id')->nullable();
                $table->unsignedBigInteger('account_id')->nullable();
                $table->unsignedBigInteger('budget_id');
                $table->unsignedBigInteger('category_id');
                $table->decimal('amount', 15, 2)->default(0);
                $table->date('date')->nullable();
                $table->string('description')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        // Add foreign keys only when referenced tables exist, and avoid duplicates
        if (Schema::hasTable('budget_expenses')) {
            // budget_id foreign key
            if (Schema::hasTable('budgets')) {
                $fkName = 'budget_expenses_budget_id_foreign';
                $exists = DB::table('information_schema.TABLE_CONSTRAINTS')
                    ->where('CONSTRAINT_SCHEMA', DB::raw('DATABASE()'))
                    ->where('TABLE_NAME', 'budget_expenses')
                    ->where('CONSTRAINT_NAME', $fkName)
                    ->exists();
                if (!$exists) {
                    DB::statement('ALTER TABLE budget_expenses ADD CONSTRAINT '.$fkName.' FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE');
                }
            }

            // category_id foreign key
            if (Schema::hasTable('categories')) {
                $fkName = 'budget_expenses_category_id_foreign';
                $exists = DB::table('information_schema.TABLE_CONSTRAINTS')
                    ->where('CONSTRAINT_SCHEMA', DB::raw('DATABASE()'))
                    ->where('TABLE_NAME', 'budget_expenses')
                    ->where('CONSTRAINT_NAME', $fkName)
                    ->exists();
                if (!$exists) {
                    DB::statement('ALTER TABLE budget_expenses ADD CONSTRAINT '.$fkName.' FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE');
                }
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_expenses');
    }
};
