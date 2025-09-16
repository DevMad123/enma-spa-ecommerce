<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Brand;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $file = database_path('seeders/data/brands.json');
        $brands = json_decode(file_get_contents($file), true);

        foreach ($brands as $b) {
            Brand::firstOrCreate(
                ['name' => $b['name']],
                [
                    'image' => $b['image'] ?? null,
                    'status' => $b['status'] ?? true,
                ]
            );
        }
    }
}
