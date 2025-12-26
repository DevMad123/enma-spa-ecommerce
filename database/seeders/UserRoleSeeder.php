<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Role;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1) Assignations robustes par email et nom de rôle (ne dépend pas des IDs)
        $pairsByEmail = [
            ['email' => 'admin@enma-shop.com', 'role' => 'Admin'],
            ['email' => 'admin@enma-shop.com', 'role' => 'Manager'],
            ['email' => 'john@example.com', 'role' => 'Staff'],
            ['email' => 'john@example.com', 'role' => 'Customer'],
        ];

        foreach ($pairsByEmail as $pair) {
            $user = User::where('email', $pair['email'])->first();
            $role = Role::where('name', $pair['role'])->first();
            if ($user && $role) {
                DB::table('user_role')->updateOrInsert(
                    [
                        'user_id' => $user->id,
                        'role_id' => $role->id,
                    ],
                    [
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

        // 2) Support optionnel de user_role.json si présent ET si les IDs existent réellement
        $file = database_path('seeders/data/user_role.json');
        if (is_file($file)) {
            $userRoles = json_decode(file_get_contents($file), true) ?: [];
            foreach ($userRoles as $ur) {
                $userExists = User::where('id', $ur['user_id'] ?? null)->exists();
                $roleExists = Role::where('id', $ur['role_id'] ?? null)->exists();
                if ($userExists && $roleExists) {
                    DB::table('user_role')->updateOrInsert(
                        [
                            'user_id' => $ur['user_id'],
                            'role_id' => $ur['role_id'],
                        ],
                        [
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                }
            }
        }
    }
}
