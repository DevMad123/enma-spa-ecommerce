<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductColor;

class ProductColorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $file = database_path('seeders/data/product_colors.json');
        $colors = json_decode(file_get_contents($file), true);

        foreach ($colors as $c) {
            ProductColor::firstOrCreate(
                ['name' => $c['name']],
                [
                    'color_code' => $c['color_code'] ?? null,
                ]
            );
        }
    }
}
