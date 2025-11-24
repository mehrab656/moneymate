<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Ramsey\Uuid\Uuid;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Helper to insert two rows using only existing columns
        $insertTwo = function (string $table, array $rows) {
            if (!Schema::hasTable($table)) {
                return;
            }
            $count = DB::table($table)->count();
            if ($count >= 2) {
                return;
            }
            $columns = Schema::getColumnListing($table);
            $toInsert = [];
            foreach ($rows as $row) {
                // Filter to existing columns only
                $filtered = array_intersect_key($row, array_flip($columns));
                // Ensure timestamps if present
                if (in_array('created_at', $columns) && !isset($filtered['created_at'])) {
                    $filtered['created_at'] = now();
                }
                if (in_array('updated_at', $columns) && !isset($filtered['updated_at'])) {
                    $filtered['updated_at'] = now();
                }
                $toInsert[] = $filtered;
            }
            if (!empty($toInsert)) {
                DB::table($table)->insert($toInsert);
            }
        };

        // Seed users (ensure at least 2)
        $insertTwo('users', [
            [
                'slug' => (string) Uuid::uuid4(),
                'username' => 'Demo User 1',
                'email' => 'demo1@moneymate.test',
                'password' => bcrypt('12345678'),
                'role_as' => 'user',
                'active' => true,
                'primary_company' => null,
            ],
            [
                'slug' => (string) Uuid::uuid4(),
                'username' => 'Demo User 2',
                'email' => 'demo2@moneymate.test',
                'password' => bcrypt('12345678'),
                'role_as' => 'user',
                'active' => true,
                'primary_company' => null,
            ],
        ]);

        // Fetch user ids for relations
        $userIds = DB::table('users')->limit(2)->pluck('id')->toArray();
        $user1 = $userIds[0] ?? null;
        $user2 = $userIds[1] ?? $user1;

        // Companies
        $insertTwo('companies', [
            [
                'slug' => (string) Uuid::uuid4(),
                'name' => 'Demo Company A',
                'email' => 'companyA@moneymate.test',
                'phone' => '000-000-0001',
                'address' => 'Demo Address A',
                'uid' => 'CMP-A',
                'activity' => 'Demo Activity',
                'license_no' => 'LIC-A',
                'registration_number' => 'REG-A',
                'created_by' => $user1,
                'updated_by' => $user1,
            ],
            [
                'slug' => (string) Uuid::uuid4(),
                'name' => 'Demo Company B',
                'email' => 'companyB@moneymate.test',
                'phone' => '000-000-0002',
                'address' => 'Demo Address B',
                'uid' => 'CMP-B',
                'activity' => 'Demo Activity',
                'license_no' => 'LIC-B',
                'registration_number' => 'REG-B',
                'created_by' => $user1,
                'updated_by' => $user1,
            ],
        ]);

        $companyIds = Schema::hasTable('companies') ? DB::table('companies')->limit(2)->pluck('id')->toArray() : [];
        $company1 = $companyIds[0] ?? null;
        $company2 = $companyIds[1] ?? $company1;

        // company_user pivot
        if (Schema::hasTable('company_user') && $company1 && $user1) {
            $existing = DB::table('company_user')->count();
            if ($existing < 2) {
                DB::table('company_user')->insert(array_filter([
                    [
                        'company_id' => $company1,
                        'user_id' => $user1,
                        'role_id' => 1,
                        'status' => true,
                        'created_by' => $user1,
                        'updated_by' => $user1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    $company2 && $user2 ? [
                        'company_id' => $company2,
                        'user_id' => $user2,
                        'role_id' => 1,
                        'status' => true,
                        'created_by' => $user1,
                        'updated_by' => $user1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ] : null,
                ]));
            }
        }

        // Bank names
        $insertTwo('bank_names', [
            [
                'bank_name' => 'Demo Bank A',
                'user_id' => $user1,
            ],
            [
                'bank_name' => 'Demo Bank B',
                'user_id' => $user2,
            ],
        ]);
        $bankNameIds = Schema::hasTable('bank_names') ? DB::table('bank_names')->limit(2)->pluck('id')->toArray() : [];
        $bankName1 = $bankNameIds[0] ?? null;
        $bankName2 = $bankNameIds[1] ?? $bankName1;

        // Bank accounts
        $insertTwo('bank_accounts', [
            [
                'account_name' => 'Primary Account',
                'account_number' => 'ACC-0001',
                'user_id' => $user1,
                'company_id' => $company1,
                'bank_name_id' => $bankName1,
                'balance' => 1000,
            ],
            [
                'account_name' => 'Savings Account',
                'account_number' => 'ACC-0002',
                'user_id' => $user2,
                'company_id' => $company2,
                'bank_name_id' => $bankName2,
                'balance' => 2000,
            ],
        ]);
        $accountIds = Schema::hasTable('bank_accounts') ? DB::table('bank_accounts')->limit(2)->pluck('id')->toArray() : [];
        $account1 = $accountIds[0] ?? null;
        $account2 = $accountIds[1] ?? $account1;

        // Sectors
        $insertTwo('sectors', [
            [
                'slug' => (string) Uuid::uuid4(),
                'name' => 'Hospitality',
                'company_id' => $company1,
                'payment_account_id' => $account1,
                'contract_start_date' => now()->format('Y-m-d'),
                'contract_end_date' => now()->addMonths(12)->format('Y-m-d'),
                'el_note' => 'Demo sector A',
            ],
            [
                'slug' => (string) Uuid::uuid4(),
                'name' => 'Retail',
                'company_id' => $company2,
                'payment_account_id' => $account2,
                'contract_start_date' => now()->format('Y-m-d'),
                'contract_end_date' => now()->addMonths(12)->format('Y-m-d'),
                'el_note' => 'Demo sector B',
            ],
        ]);
        $sectorIds = Schema::hasTable('sectors') ? DB::table('sectors')->limit(2)->pluck('id')->toArray() : [];
        $sector1 = $sectorIds[0] ?? null;
        $sector2 = $sectorIds[1] ?? $sector1;

        // Categories
        $insertTwo('categories', [
            [
                'name' => 'Rent',
                'sector_id' => $sector1,
            ],
            [
                'name' => 'Utilities',
                'sector_id' => $sector2,
            ],
        ]);
        $categoryIds = Schema::hasTable('categories') ? DB::table('categories')->limit(2)->pluck('id')->toArray() : [];
        $category1 = $categoryIds[0] ?? null;
        $category2 = $categoryIds[1] ?? $category1;

        // Wallets
        $insertTwo('wallets', [
            [
                'slug' => (string) Uuid::uuid4(),
                'name' => 'Main Wallet',
                'user_id' => $user1,
                'company_id' => $company1,
                'balance' => 500,
            ],
            [
                'slug' => (string) Uuid::uuid4(),
                'name' => 'Travel Wallet',
                'user_id' => $user2,
                'company_id' => $company2,
                'balance' => 300,
            ],
        ]);

        // Budgets
        $insertTwo('budgets', [
            [
                'name' => 'Monthly Budget A',
                'user_id' => $user1,
                'company_id' => $company1,
                'account_id' => $account1,
                'amount' => 1500,
                'start_date' => now()->startOfMonth()->format('Y-m-d'),
                'end_date' => now()->endOfMonth()->format('Y-m-d'),
            ],
            [
                'name' => 'Monthly Budget B',
                'user_id' => $user2,
                'company_id' => $company2,
                'account_id' => $account2,
                'amount' => 1200,
                'start_date' => now()->startOfMonth()->format('Y-m-d'),
                'end_date' => now()->endOfMonth()->format('Y-m-d'),
            ],
        ]);
        $budgetIds = Schema::hasTable('budgets') ? DB::table('budgets')->limit(2)->pluck('id')->toArray() : [];
        $budget1 = $budgetIds[0] ?? null;
        $budget2 = $budgetIds[1] ?? $budget1;

        // Budget categories pivot
        if (Schema::hasTable('budget_category') && $budget1 && $category1) {
            $existingBC = DB::table('budget_category')->count();
            if ($existingBC < 2) {
                DB::table('budget_category')->insert(array_filter([
                    [
                        'budget_id' => $budget1,
                        'category_id' => $category1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    $budget2 && $category2 ? [
                        'budget_id' => $budget2,
                        'category_id' => $category2,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ] : null,
                ]));
            }
        }

        // Budget expenses demo rows (for pie-data)
        if (Schema::hasTable('budget_expenses') && $budget1 && $category1) {
            $existingBE = DB::table('budget_expenses')->count();
            if ($existingBE < 2) {
                DB::table('budget_expenses')->insert(array_filter([
                    [
                        'user_id' => $user1,
                        'company_id' => $company1,
                        'account_id' => $account1,
                        'budget_id' => $budget1,
                        'category_id' => $category1,
                        'amount' => 60,
                        'date' => now()->format('Y-m-d'),
                        'description' => 'Demo budget expense A',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    $budget2 && $category2 ? [
                        'user_id' => $user2,
                        'company_id' => $company2,
                        'account_id' => $account2,
                        'budget_id' => $budget2,
                        'category_id' => $category2,
                        'amount' => 75,
                        'date' => now()->format('Y-m-d'),
                        'description' => 'Demo budget expense B',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ] : null,
                ]));
            }
        }

        // Expenses
        $insertTwo('expenses', [
            [
                'slug' => (string) Uuid::uuid4(),
                'user_id' => $user1,
                'company_id' => $company1,
                'account_id' => $account1,
                'amount' => 100,
                'category_id' => $category1,
                'description' => 'Demo expense A',
                'date' => now()->format('Y-m-d'),
            ],
            [
                'slug' => (string) Uuid::uuid4(),
                'user_id' => $user2,
                'company_id' => $company2,
                'account_id' => $account2,
                'amount' => 80,
                'category_id' => $category2,
                'description' => 'Demo expense B',
                'date' => now()->format('Y-m-d'),
            ],
        ]);

        // Incomes
        $insertTwo('incomes', [
            [
                'slug' => (string) Uuid::uuid4(),
                'user_id' => $user1,
                'company_id' => $company1,
                'account_id' => $account1,
                'amount' => 250,
                'category_id' => $category1,
                'description' => 'Demo income A',
                'date' => now()->format('Y-m-d'),
                'income_type' => 'general',
            ],
            [
                'slug' => (string) Uuid::uuid4(),
                'user_id' => $user2,
                'company_id' => $company2,
                'account_id' => $account2,
                'amount' => 300,
                'category_id' => $category2,
                'description' => 'Demo income B',
                'date' => now()->format('Y-m-d'),
                'income_type' => 'general',
            ],
        ]);

        // Debts
        $insertTwo('debts', [
            [
                'user_id' => $user1,
                'company_id' => $company1,
                'account_id' => $account1,
                'amount' => 500,
                'type' => 'lend',
                'person' => 'John Doe',
                'date' => now()->format('Y-m-d'),
                'note' => 'Demo debt A',
            ],
            [
                'user_id' => $user2,
                'company_id' => $company2,
                'account_id' => $account2,
                'amount' => 400,
                'type' => 'borrow',
                'person' => 'Jane Smith',
                'date' => now()->format('Y-m-d'),
                'note' => 'Demo debt B',
            ],
        ]);
        $debtIds = Schema::hasTable('debts') ? DB::table('debts')->limit(2)->pluck('id')->toArray() : [];
        $debt1 = $debtIds[0] ?? null;
        $debt2 = $debtIds[1] ?? $debt1;

        // Lends
        $insertTwo('lends', [
            [
                'debt_id' => $debt1,
                'account_id' => $account1,
                'company_id' => $company1,
                'amount' => 150,
                'date' => now()->format('Y-m-d'),
                'note' => 'Demo lend A',
            ],
            [
                'debt_id' => $debt2,
                'account_id' => $account2,
                'company_id' => $company2,
                'amount' => 120,
                'date' => now()->format('Y-m-d'),
                'note' => 'Demo lend B',
            ],
        ]);

        // Borrows
        $insertTwo('borrows', [
            [
                'debt_id' => $debt1,
                'account_id' => $account1,
                'company_id' => $company1,
                'amount' => 90,
                'date' => now()->format('Y-m-d'),
                'note' => 'Demo borrow A',
            ],
            [
                'debt_id' => $debt2,
                'account_id' => $account2,
                'company_id' => $company2,
                'amount' => 75,
                'date' => now()->format('Y-m-d'),
                'note' => 'Demo borrow B',
            ],
        ]);

        // Repayments
        $insertTwo('repayments', [
            [
                'debt_id' => $debt1,
                'account_id' => $account1,
                'company_id' => $company1,
                'amount' => 50,
                'date' => now()->format('Y-m-d'),
            ],
            [
                'debt_id' => $debt2,
                'account_id' => $account2,
                'company_id' => $company2,
                'amount' => 40,
                'date' => now()->format('Y-m-d'),
            ],
        ]);

        // Debt Collections
        $insertTwo('debt_collections', [
            [
                'debt_id' => $debt1,
                'account_id' => $account1,
                'company_id' => $company1,
                'amount' => 20,
                'date' => now()->format('Y-m-d'),
            ],
            [
                'debt_id' => $debt2,
                'account_id' => $account2,
                'company_id' => $company2,
                'amount' => 25,
                'date' => now()->format('Y-m-d'),
            ],
        ]);

        // Channels
        $insertTwo('channels', [
            [
                'channel_name' => 'Online',
                'sector_id' => $sector1,
            ],
            [
                'channel_name' => 'Offline',
                'sector_id' => $sector2,
            ],
        ]);

        // Payments (sector scoped)
        $insertTwo('payments', [
            [
                'sector_id' => $sector1,
                'amount' => 100,
                'note' => 'Demo payment A',
                'payment_number' => 'PMT-0001',
                'date' => now()->format('Y-m-d'),
            ],
            [
                'sector_id' => $sector2,
                'amount' => 150,
                'note' => 'Demo payment B',
                'payment_number' => 'PMT-0002',
                'date' => now()->format('Y-m-d'),
            ],
        ]);

        // Subscriptions (for both users)
        $insertTwo('subscriptions', [
            [
                'user_id' => $user1,
                'status' => 'active',
                'current_period_start' => now()->subDays(1),
                'current_period_end' => now()->addDays(29),
                'plan' => 'trial',
                'product_id' => 'demo_product',
                'price_id' => 'demo_price',
                'amount' => 0,
            ],
            [
                'user_id' => $user2,
                'status' => 'active',
                'current_period_start' => now()->subDays(1),
                'current_period_end' => now()->addDays(29),
                'plan' => 'trial',
                'product_id' => 'demo_product',
                'price_id' => 'demo_price',
                'amount' => 0,
            ],
        ]);

        // Roles (optional)
        $insertTwo('roles', [
            [
                'slug' => (string) Uuid::uuid4(),
                'role' => 'admin',
                'company_id' => $company1,
                'status' => true,
                'permissions' => json_encode([]),
                'created_by' => $user1,
                'updated_by' => $user1,
            ],
            [
                'slug' => (string) Uuid::uuid4(),
                'role' => 'user',
                'company_id' => $company2,
                'status' => true,
                'permissions' => json_encode([]),
                'created_by' => $user1,
                'updated_by' => $user1,
            ],
        ]);

        // Options & Settings minimal entries
        $insertTwo('options', [
            [ 'key' => 'site_name', 'value' => 'Moneymate' ],
            [ 'key' => 'currency', 'value' => 'AED' ],
        ]);
        $insertTwo('settings', [
            [ 'key' => 'theme', 'value' => 'light', 'company_id' => $company1 ],
            [ 'key' => 'notifications', 'value' => 'enabled', 'company_id' => $company2 ],
        ]);

        // Activity logs minimal entries
        $insertTwo('activity_logs', [
            [
                'object' => 'seed',
                'log_type' => 'info',
                'module' => 'seeder',
                'descriptions' => 'Demo seed A',
                'user_id' => $user1,
                'company_id' => $company1,
                'uid' => 'SEED-UID-A',
                'data_records' => json_encode(['seed' => true]),
            ],
            [
                'object' => 'seed',
                'log_type' => 'info',
                'module' => 'seeder',
                'descriptions' => 'Demo seed B',
                'user_id' => $user2,
                'company_id' => $company2,
                'uid' => 'SEED-UID-B',
                'data_records' => json_encode(['seed' => true]),
            ],
        ]);
    }
}
