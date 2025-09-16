<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $file = database_path('seeders/data/user_role.json');
        $userRoles = json_decode(file_get_contents($file), true);

        foreach ($userRoles as $ur) {
            DB::table('user_role')->updateOrInsert(
                [
                    'user_id' => $ur['user_id'],
                    'role_id' => $ur['role_id']
                ],
                [
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }
    }
}
