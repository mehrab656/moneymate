<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BankAccountSeeder extends Seeder
{
    /**
     * Run the seeder.
     *
     * @return void
     */
    public function run()
    {
        $accounts = [];

        for ($i = 1; $i <= 10; $i++) {
            $accounts[] = [
                'user_id' => $i, // Assuming user IDs exist from 1 to 10
                'bank_name_id' => $i, // Assuming bank name IDs exist from 1 to 10
                'account_name' => 'Account ' . $i,
                'account_number' => 'ACCT-' . $i,
                'balance' => rand(20000,50000),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert the accounts while checking for uniqueness
        foreach ($accounts as $account) {
            $existingAccount = DB::table('bank_accounts')->where('account_name', $account['account_name'])
                ->orWhere('account_number', $account['account_number'])->first();

            if (!$existingAccount) {
                DB::table('bank_accounts')->insert($account);
            }
        }
    }
}
