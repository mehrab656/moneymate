<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create user role
        $userRole = Role::create(['name' => 'user']);



        // Assign role to a user
        $user = User::create([
            'name' => 'Mahmudur Rahman',
            'email' => 'shibly.phy@gmail.com',
            'password' => bcrypt('12345678'),
        ]);

        $user->assignRole($userRole);

        // Clear the permission cache
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
