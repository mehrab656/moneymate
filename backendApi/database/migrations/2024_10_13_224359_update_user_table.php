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
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'first_name')) {
                    $table->string('first_name')->nullable()->after('name');
                }
                if (!Schema::hasColumn('users', 'last_name')) {
                    $table->string('last_name')->nullable()->after('first_name');
                }
                if (!Schema::hasColumn('users', 'phone')) {
                    $table->string('phone')->nullable()->after('last_name');
                }
                if (!Schema::hasColumn('users', 'emergency_contract')) {
                    $table->string('emergency_contract')->nullable()->after('phone');
                }
                if (!Schema::hasColumn('users', 'dob')) {
                    $table->string('dob')->nullable()->after('emergency_contract');
                }
                if (!Schema::hasColumn('users', 'last_ip_address')) {
                    $table->ipAddress('last_ip_address')->nullable()->after('dob');
                }
                if (!Schema::hasColumn('users', 'ip_address')) {
                    $table->ipAddress()->nullable()->after('last_ip_address');
                }
                if (!Schema::hasColumn('users', 'activation_code')) {
                    $table->string('activation_code', 40)->nullable()->after('ip_address');
                }
                if (!Schema::hasColumn('users', 'forgotten_password_code')) {
                    $table->string('forgotten_password_code', 40)->nullable()->after('activation_code');
                }
                if (!Schema::hasColumn('users', 'forgotten_password_time')) {
                    $table->integer('forgotten_password_time')->nullable()->after('forgotten_password_code');
                }
                if (!Schema::hasColumn('users', 'remember_code')) {
                    $table->string('remember_code', 40)->nullable()->after('forgotten_password_time');
                }
                if (!Schema::hasColumn('users', 'active')) {
                    $table->boolean('active')->default(true)->after('remember_code');
                }
                if (!Schema::hasColumn('users', 'gender')) {
                    $table->string('gender', 20)->nullable()->after('active');
                }
                if (!Schema::hasColumn('users', 'options')) {
                    $table->json('options')->nullable()->after('gender');
                }
                if (Schema::hasColumn('users', 'name') && !Schema::hasColumn('users', 'username')) {
                    $table->renameColumn('name', 'username');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                foreach (['first_name','last_name','phone','emergency_contract','dob','last_ip_address','ip_address','activation_code','forgotten_password_code','forgotten_password_time','remember_code','active','gender','options'] as $col) {
                    if (Schema::hasColumn('users', $col)) {
                        $table->dropColumn($col);
                    }
                }
                if (Schema::hasColumn('users', 'username') && !Schema::hasColumn('users', 'name')) {
                    $table->renameColumn('username', 'name');
                }
            });
        }
    }
};
