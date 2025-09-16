<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductSize;

class ProductSizeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $file = database_path('seeders/data/product_sizes.json');
        $sizes = json_decode(file_get_contents($file), true);

        foreach ($sizes as $s) {
            ProductSize::firstOrCreate(
                ['size' => $s['size']]
            );
        }
    }
}
