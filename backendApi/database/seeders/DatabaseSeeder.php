<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

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

        // Seed bank_names with at least two rows
        if (class_exists(BankNameSeeder::class)) {
            $this->call(BankNameSeeder::class);
        }

        // Ensure at least 2 rows in each main table
        $this->call(DemoDataSeeder::class);

        // Ensure every existing table has at least two rows
        $this->call(EnsureTwoSeeder::class);
    }
}
