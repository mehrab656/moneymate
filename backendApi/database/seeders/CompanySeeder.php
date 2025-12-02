<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('companies')) {
            return; // companies table missing; skip
        }

        $nameColumn = null;
        if (Schema::hasColumn('companies', 'name')) {
            $nameColumn = 'name';
        } elseif (Schema::hasColumn('companies', 'company_name')) {
            $nameColumn = 'company_name';
        }

        if (!$nameColumn) {
            return; // no suitable name column to seed
        }

        $companies = ['Acme Demo Ltd', 'Globex Demo Inc'];

        foreach ($companies as $name) {
            $data = [
                $nameColumn => $name,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            if (Schema::hasColumn('companies', 'slug')) {
                $data['slug'] = Str::slug($name);
            }

            // Fill common required columns when present
            if (Schema::hasColumn('companies', 'phone')) {
                $data['phone'] = '0000000000';
            }
            if (Schema::hasColumn('companies', 'email')) {
                $data['email'] = 'demo@company.test';
            }
            if (Schema::hasColumn('companies', 'address')) {
                $data['address'] = 'Demo Address';
            }
            if (Schema::hasColumn('companies', 'user_id')) {
                $data['user_id'] = 1; // link to seeded user
            }
            if (Schema::hasColumn('companies', 'status')) {
                $data['status'] = 1;
            }
            if (Schema::hasColumn('companies', 'uid')) {
                $data['uid'] = Str::random(8);
            }
            if (Schema::hasColumn('companies', 'created_by')) {
                $data['created_by'] = 1;
            }
            if (Schema::hasColumn('companies', 'updated_by')) {
                $data['updated_by'] = 1;
            }

            DB::table('companies')->updateOrInsert(
                [$nameColumn => $name],
                $data
            );

            // Fetch the company id for relation setup
            $company = DB::table('companies')->where($nameColumn, $name)->first();

            // Create pivot relation to grant access to user id=1
            if ($company && Schema::hasTable('company_user')) {
                DB::table('company_user')->updateOrInsert(
                    ['company_id' => $company->id, 'user_id' => 1],
                    [
                        'role_id'    => 1,
                        'status'     => true,
                        'created_by' => 1,
                        'updated_by' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }

            // Set user's primary_company to the first seeded company when column exists
            if ($company && Schema::hasTable('users') && Schema::hasColumn('users', 'primary_company')) {
                DB::table('users')->where('id', 1)->update(['primary_company' => $company->id]);
            }
        }
    }
}
