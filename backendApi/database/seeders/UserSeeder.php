<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('users')) {
            return; // users table missing; skip
        }

        // Seed a specific user account (safe if SingleUserSeeder already ran)
        $data = [
            'email' => 'hossainmehraab@gmail.com',
            'password' => Hash::make('12345678'),
            'created_at' => now(),
            'updated_at' => now(),
        ];

        if (Schema::hasColumn('users', 'email_verified_at')) {
            $data['email_verified_at'] = now();
        }

        // Prefer 'username' when present; fall back to 'name'
        if (Schema::hasColumn('users', 'username')) {
            $data['username'] = 'Mehrab Hossain';
        } elseif (Schema::hasColumn('users', 'name')) {
            $data['name'] = 'Mehrab Hossain';
        }

        DB::table('users')->updateOrInsert(
            ['email' => 'hossainmehraab@gmail.com'],
            $data
        );
    }
}
