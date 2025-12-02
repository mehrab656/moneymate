<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('roles') || !Schema::hasTable('permissions')) {
            return; // required tables missing; skip
        }

        // Ensure "user" role exists
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Create permissions if they don't already exist
        $createCategoryPermission = Permission::firstOrCreate(['name' => 'create_category']);
        $editCategoryPermission = Permission::firstOrCreate(['name' => 'edit_category']);

        // Assign permissions to the "user" role
        if ($userRole) {
            $userRole->syncPermissions([
                $createCategoryPermission,
                $editCategoryPermission,
            ]);
        }
    }
}
