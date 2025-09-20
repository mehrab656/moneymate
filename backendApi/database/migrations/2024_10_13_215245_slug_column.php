<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Ramsey\Uuid\Uuid;

return new class extends Migration {

    protected array $tables = [
        'assets',
        'bank_accounts',
        'categories',
        'companies',
        'employees',
        'expenses',
        'incomes',
        'investments',
        'roles',
        'sectors',
        'tasks',
        'users',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach ($this->tables as $key=>$tableName) {
            $uuid = Uuid::uuid4() . $key;

            Schema::table($tableName, function (Blueprint $table)  use($tableName){
                $table->string('slug')->after('id');

            });
            DB::statement("UPDATE $tableName SET slug = CONCAT(id,'$uuid')");

        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('slug');
            });
        }
    }
};
