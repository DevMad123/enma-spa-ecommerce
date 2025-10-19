<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductSubCategory;
use App\Models\Brand;
use App\Models\Supplier;

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
            // Catégorie obligatoire: fallback sur la première catégorie si l'ID indiqué est invalide
            $catId = $p['category_id'] ?? null;
            if ($catId && !ProductCategory::find($catId)) {
                $catId = ProductCategory::query()->value('id');
            }
            if (!$catId) {
                if (isset($this->command)) {
                    $this->command->warn("[ProductSeeder] Catégorie introuvable pour le produit {$p['name']}, ignoré.");
                }
                continue;
            }

            // Sous-catégorie optionnelle: la supprimer si l'ID n'existe pas
            $subcatId = $p['subcategory_id'] ?? null;
            if ($subcatId && !ProductSubCategory::find($subcatId)) {
                $subcatId = null;
            }

            // Marque et fournisseur: ignorer si IDs invalides
            $brandId = $p['brand_id'] ?? null;
            if ($brandId && !Brand::find($brandId)) {
                $brandId = null;
            }
            $supplierId = $p['supplier_id'] ?? null;
            if ($supplierId && !Supplier::find($supplierId)) {
                $supplierId = null;
            }

            Product::updateOrCreate(
                ['code' => $p['code']],
                [
                    'name' => $p['name'],
                    'category_id' => $catId,
                    'subcategory_id' => $subcatId,
                    'brand_id' => $brandId,
                    'supplier_id' => $supplierId,
                    'image_path' => $p['image_path'] ?? null,
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

