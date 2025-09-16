<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductImage;
use App\Models\Product;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $file = database_path('seeders/data/product_images.json');
        $images = json_decode(file_get_contents($file), true);

        foreach ($images as $img) {
            $product = Product::where('name', $img['product'])->first();

            if (!$product) {
                continue; // ignore si le produit n’existe pas
            }

            ProductImage::firstOrCreate(
                ['product_id' => $product->id, 'image' => $img['image']],
                [
                    'status' => $img['status'] ?? 1,
                    'created_by' => 1,
                    'updated_by' => 1,
                ]
            );
        }
    }
}
