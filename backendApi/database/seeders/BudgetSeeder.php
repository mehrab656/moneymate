<?php

namespace Database\Seeders;

use App\Models\BankAccount;
use App\Models\Budget;
use App\Models\Category;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BudgetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::whereIn('type', ['expense'])->pluck('id');
        $bankAccounts = BankAccount::pluck('id');

        // Create dummy budgets
        for ($i = 1; $i <= 10; $i++) {
            $budget = Budget::create([
                'user_id' => 1,
                'budget_name' => "Budget $i",
                'amount' => rand(100, 1000),
                'time_range' => Carbon::now()->subMonths($i)->format('Y-m-d') . '-' . Carbon::now()->format('Y-m-d'),
                'account_id' => $bankAccounts->random(),
            ]);

            $budget->categories()->sync($categories->random(rand(1, min($categories->count(), 5))));
        }
    }
}
