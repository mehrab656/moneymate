<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
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

        // Skip creating roles here; user will use role_as='user'

        $email = 'hossainmehraab@gmail.com';
        $password = Hash::make('12345678');
        $username = 'Mehrab Hossain';

        $user = User::where('email', $email)->first();

        if ($user) {
            $user->update([
                'password' => $password,
                'active' => true,
                'role_as' => 'user',
            ]);
        } else {
            $data = [
                'slug' => Uuid::uuid4(),
                'username' => $username,
                'email' => $email,
                'password' => $password,
                'active' => true,
                'role_as' => 'user',
            ];
            if (Schema::hasColumn('users', 'primary_company')) {
                $data['primary_company'] = 1; // default company id if applicable
            }
            $user = User::create($data);
        }
        // No role assignment method on User; role_as string used
    }
}
