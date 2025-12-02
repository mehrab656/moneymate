<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run existing seeders when available
        if (class_exists(OptionSeeder::class)) {
            $this->call(OptionSeeder::class);
        }
        if (class_exists(UserPermissionSeeder::class)) {
            $this->call(UserPermissionSeeder::class);
        }
        if (class_exists(SingleUserSeeder::class)) {
            $this->call(SingleUserSeeder::class);
        }

        // Seed requested demo user and companies
        if (class_exists(UserSeeder::class)) {
            $this->call(UserSeeder::class);
        }
        if (class_exists(CompanySeeder::class)) {
            $this->call(CompanySeeder::class);
        }

        // Seed bank_names only if table exists
        if (class_exists(BankNameSeeder::class) && Schema::hasTable('bank_names')) {
            $this->call(BankNameSeeder::class);
        }

        // Ensure at least 2 rows in each main table (only when core tables exist)
        if (Schema::hasTable('users')) {
            $this->call(DemoDataSeeder::class);
        }

        // Ensure every existing table has at least two rows (only when core tables exist)
        if (Schema::hasTable('users')) {
            $this->call(EnsureTwoSeeder::class);
        }
    }
}
