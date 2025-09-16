<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $file = database_path('seeders/data/roles.json');
        $roles = json_decode(file_get_contents($file), true);

        foreach ($roles as $r) {
            Role::firstOrCreate(
                ['name' => $r['name']],
                [
                    'status' => $r['status'] ?? 1,
                ]
            );
        }
    }
}
