<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the seeder.
     *
     * @return void
     */
    public function run()
    {
        $incomeCategories = [
            'Salary',
            'Freelance Income',
            'Investment Returns',
            'Rental Income',
            'Business Revenue',
        ];

        $expenseCategories = [
            'Rent',
            'Groceries',
            'Transportation',
            'Utilities',
            'Entertainment',
        ];

        $categories = [];

        // Generate random income categories
        foreach ($incomeCategories as $categoryName) {
            $categories[] = [
                'user_id' => random_int(1, 10), // Assuming user IDs exist from 1 to 10
                'name' => $categoryName,
                'type' => 'income',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Generate random expense categories
        foreach ($expenseCategories as $categoryName) {
            $categories[] = [
                'user_id' => random_int(1, 10), // Assuming user IDs exist from 1 to 10
                'name' => $categoryName,
                'type' => 'expense',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('categories')->insert($categories);
    }
}
