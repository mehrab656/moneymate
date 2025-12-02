<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BankNameSeeder extends Seeder
{
    /**
     * Run the seeder.
     *
     * @return void
     * @throws \Exception
     */
    public function run(): void
    {
        // Seed at least two deterministic rows to avoid unique conflicts on reruns
        $now = now();
        $banks = [
            ['company_id' => 1, 'user_id' => 1, 'bank_name' => 'Eastern Bank', 'created_at' => $now, 'updated_at' => $now],
            ['company_id' => 1, 'user_id' => 1, 'bank_name' => 'Western Bank', 'created_at' => $now, 'updated_at' => $now],
        ];

        // Use upsert to be idempotent across multiple runs
        DB::table('bank_names')->upsert(
            $banks,
            ['company_id', 'user_id', 'bank_name'],
            ['updated_at']
        );
    }
}
