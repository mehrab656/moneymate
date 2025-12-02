<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Ramsey\Uuid\Uuid;

class SingleUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('users')) {
            return; // users table missing; skip
        }

        // Deterministic demo credentials
        $email = 'hossainmehraab@gmail.com';
        $password = Hash::make('12345678');
        $username = 'Mehrab Hossain';

        // Ensure a user with id=1 exists to match seeded relations
        $user = User::find(1);

        if ($user) {
            $user->update([
                'username' => $username,
                'email' => $email,
                'password' => $password,
                'active' => true,
                'role_as' => 'user',
            ]);
        } else {
            $data = [
                'id' => 1,
                'slug' => Uuid::uuid4(),
                'username' => $username,
                'email' => $email,
                'password' => $password,
                'active' => true,
                'role_as' => 'user',
            ];
            // Set primary_company if the column exists; no FK enforced in migration
            if (Schema::hasColumn('users', 'primary_company')) {
                $data['primary_company'] = 1;
            }
            User::create($data);
        }
    }
}

