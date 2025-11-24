<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->uuid('slug')->unique();
                $table->string('username');
                $table->string('first_name')->nullable();
                $table->string('last_name')->nullable();
                $table->string('phone')->nullable();
                $table->string('emergency_contact')->nullable();
                $table->date('dob')->nullable();
                $table->string('gender')->nullable();
                $table->string('activation_code')->nullable();
                $table->string('email')->unique();
                $table->string('profile_picture')->nullable();
                $table->string('password');
                $table->string('role_as')->nullable();
                $table->unsignedBigInteger('primary_company')->nullable();
                $table->boolean('active')->default(true);
                $table->rememberToken();
                $table->timestamps();
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users')) {
            Schema::dropIfExists('users');
        }
    }
};

