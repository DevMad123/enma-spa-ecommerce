<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductCategory;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $file = database_path('seeders/data/product_categories.json');
        $categories = json_decode(file_get_contents($file), true);

        foreach ($categories as $c) {
            ProductCategory::firstOrCreate(
                ['name' => $c['name']],
                [
                    'image' => $c['image'] ?? null,
                    'note' => $c['note'] ?? null,
                    'status' => $c['status'] ?? 1,
                    'is_popular' => $c['is_popular'] ?? 0,
                    'created_by' => 1,
                    'updated_by' => 1,
                ]
            );
        }
    }
}
