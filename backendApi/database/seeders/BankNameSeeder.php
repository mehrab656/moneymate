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
        $banks = [
            'Bank A',
            'Bank B',
            'Bank C',
            'Bank D',
            'Bank E',
            'Bank F',
            'Bank G',
            'Bank H',
            'Bank I',
            'Bank J',
            'Bank K',
            'Bank L',
            'Bank M',
            'Bank N',
            'Bank O',
        ];

        foreach ($banks as $bank) {
            DB::table('bank_names')->insert([
                'user_id' => random_int(1, 10), // Assuming user IDs exist from 1 to 10
                'bank_name' => $bank,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
