<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Retrieve the "user" role
        $userRole = Role::where('name', 'user')->first();

        // Create permissions
        $createCategoryPermission = Permission::create(['name' => 'create_category']);
        $editCategoryPermission = Permission::create(['name' => 'edit_category']);

        // Assign permissions to the "user" role
        $userRole->syncPermissions([
            $createCategoryPermission,
            $editCategoryPermission,
        ]);
    }
}
