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
        Schema::table('users', function (Blueprint $table) {
            $table->string( 'first_name')->nullable()->after('name');
            $table->string( 'last_name')->nullable()->after('first_name');
            $table->string( 'phone')->nullable()->after('last_name');
            $table->string( 'emergency_contract')->nullable()->after('phone');
            $table->string( 'dob')->nullable()->after('emergency_contract');
            $table->ipAddress( 'last_ip_address')->nullable()->after('dob');
            $table->ipAddress( )->nullable()->after('last_ip_address');
            $table->string('activation_code',40 )->nullable()->after('ip_address');
            $table->string('forgotten_password_code',40 )->nullable()->after('activation_code');
            $table->integer('forgotten_password_time' )->nullable()->after('forgotten_password_code');
            $table->string('remember_code',40 )->nullable()->after('forgotten_password_time');
            $table->boolean('active' )->default(true)->after('remember_code');
            $table->string('gender',20)->nullable()->after('active');
            $table->json('options')->nullable()->after('gender');
            $table->renameColumn('name', 'username');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('first_name');
            $table->dropColumn('last_name');
            $table->dropColumn('phone');
            $table->dropColumn('emergency_contract');
            $table->dropColumn('dob');
            $table->dropColumn('last_ip_address');
            $table->dropColumn('ip_address');
            $table->dropColumn('activation_code');
            $table->dropColumn('forgotten_password_code');
            $table->dropColumn('forgotten_password_time');
            $table->dropColumn('remember_code');
            $table->dropColumn('active');
            $table->dropColumn('gender');
            $table->dropColumn('options');
            $table->renameColumn('username', 'name');

        });
    }
};
