<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class OptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('options')) {
            return; // table missing; skip seeding
        }

        $defaults = [
            'company_name' => 'Quantiklab',
            'web_site' => 'https://quantiklab.com',
            'default_currency' => '$',
            'phone' => '1234553453',
            'address' => 'Address here',
            'num_data_per_page' => '15',
            'public_key' => '',
            'secret_key' => '',
            'registration_type' => 'free',
            'subscription_price' => '100',
            'product_api_id' => '',
            'product_price' => '30',
            'product_id' => '',
        ];

        foreach ($defaults as $key => $value) {
            $existing = DB::table('options')->where('key', $key)->first();
            if ($existing) {
                DB::table('options')->where('id', $existing->id)->update([
                    'value' => $value,
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('options')->insert([
                    'key' => $key,
                    'value' => $value,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}

