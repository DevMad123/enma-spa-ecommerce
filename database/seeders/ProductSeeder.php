<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductSubCategory;
use App\Models\Brand;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $file = database_path('seeders/data/products.json');
        $products = json_decode(file_get_contents($file), true);

        foreach ($products as $p) {
            Product::firstOrCreate(
                ['code' => $p['code']], // unique code comme clé
                [
                    'name' => $p['name'],
                    'category_id' => $p['category_id'] ?? null,
                    'subcategory_id' => $p['subcategory_id'] ?? null,
                    'brand_id' => $p['brand_id'] ?? null,
                    'supplier_id' => $p['supplier_id'] ?? null,
                    'image_path' => $p['image_path'] ?? null,
                    'color_id' => $p['color_id'] ?? null,
                    'size_id' => $p['size_id'] ?? null,
                    'current_purchase_cost' => $p['current_purchase_cost'] ?? 0,
                    'current_sale_price' => $p['current_sale_price'] ?? null,
                    'previous_purchase_cost' => $p['previous_purchase_cost'] ?? null,
                    'current_wholesale_price' => $p['current_wholesale_price'] ?? null,
                    'wholesale_minimum_qty' => $p['wholesale_minimum_qty'] ?? 1,
                    'previous_wholesale_price' => $p['previous_wholesale_price'] ?? null,
                    'previous_sale_price' => $p['previous_sale_price'] ?? null,
                    'available_quantity' => $p['available_quantity'] ?? 0,
                    'discount_type' => $p['discount_type'] ?? 0,
                    'discount' => $p['discount'] ?? 0,
                    'unit_type' => $p['unit_type'] ?? null,
                    'description' => $p['description'] ?? null,
                    'is_popular' => $p['is_popular'] ?? false,
                    'is_trending' => $p['is_trending'] ?? false,
                    'status' => $p['status'] ?? true,
                    'created_by' => 1,
                    'updated_by' => 1,
                ]
            );
        }
    }

}
