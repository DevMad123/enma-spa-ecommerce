<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductSubCategory;
use App\Models\ProductCategory;

class ProductSubCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $file = database_path('seeders/data/product_sub_categories.json');
        $subcategories = json_decode(file_get_contents($file), true);

        foreach ($subcategories as $sc) {
            $category = ProductCategory::where('name', $sc['category'])->first();

            if (!$category) {
                continue; // ignore si la catégorie parente n'existe pas
            }

            ProductSubCategory::firstOrCreate(
                ['name' => $sc['name'], 'category_id' => $category->id],
                [
                    'image' => $sc['image'] ?? null,
                    'note' => $sc['note'] ?? null,
                    'status' => $sc['status'] ?? 1,
                    'created_by' => 1,
                    'updated_by' => 1,
                ]
            );
        }
    }
}
