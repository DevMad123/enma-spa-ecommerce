<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductColor;
use App\Models\ProductSize;
use App\Models\Product;

class ProductAttributesSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Créer des couleurs de test
        $colors = [
            ['name' => 'Noir', 'color_code' => '#000000'],
            ['name' => 'Blanc', 'color_code' => '#FFFFFF'],
            ['name' => 'Rouge', 'color_code' => '#FF0000'],
            ['name' => 'Bleu', 'color_code' => '#0000FF'],
            ['name' => 'Vert', 'color_code' => '#00FF00'],
        ];

        foreach ($colors as $color) {
            ProductColor::firstOrCreate(['name' => $color['name']], $color);
        }

        // Créer des tailles de test
        $sizes = [
            ['size' => 'XS'], ['size' => 'S'], ['size' => 'M'], 
            ['size' => 'L'], ['size' => 'XL'], ['size' => 'XXL'],
            ['size' => '36'], ['size' => '37'], ['size' => '38'], 
            ['size' => '39'], ['size' => '40'], ['size' => '41'],
            ['size' => '42'], ['size' => '43'], ['size' => '44']
        ];

        foreach ($sizes as $size) {
            ProductSize::firstOrCreate(['size' => $size['size']]);
        }

        // Associer quelques couleurs/tailles aux premiers produits (produits simples)
        $products = Product::whereDoesntHave('variants')->take(3)->get();
        
        foreach ($products as $product) {
            // Associer quelques couleurs aléatoires
            $randomColors = ProductColor::inRandomOrder()->take(rand(2, 4))->get();
            $product->directColors()->syncWithoutDetaching($randomColors->pluck('id'));
            
            // Associer quelques tailles aléatoires
            $randomSizes = ProductSize::inRandomOrder()->take(rand(3, 6))->get();
            $product->directSizes()->syncWithoutDetaching($randomSizes->pluck('id'));
            
            echo "Produit '{$product->name}' associé avec " . 
                 $randomColors->count() . " couleurs et " . 
                 $randomSizes->count() . " tailles\n";
        }
    }
}
