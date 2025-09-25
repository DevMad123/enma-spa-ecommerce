<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ProductCategory;
use App\Models\Brand;
use App\Models\ProductColor;
use App\Models\ProductSize;
use App\Models\Product;

// Créer les catégories avec slugs
$category1 = ProductCategory::firstOrCreate([
    'name' => 'Vêtements',
    'slug' => 'vetements',
    'status' => 1
]);

$category2 = ProductCategory::firstOrCreate([
    'name' => 'Électronique',
    'slug' => 'electronique',
    'status' => 1
]);

// Créer les marques
$brand1 = Brand::firstOrCreate([
    'name' => 'Nike',
    'status' => 1
]);

$brand2 = Brand::firstOrCreate([
    'name' => 'Samsung',
    'status' => 1
]);

// Créer les couleurs
$color1 = ProductColor::firstOrCreate([
    'name' => 'Rouge',
    'color_code' => '#FF0000'
]);

$color2 = ProductColor::firstOrCreate([
    'name' => 'Bleu',
    'color_code' => '#0000FF'
]);

// Créer les tailles
$size1 = ProductSize::firstOrCreate([
    'size' => 'M'
]);

$size2 = ProductSize::firstOrCreate([
    'size' => 'L'
]);

// Créer quelques produits de test
Product::firstOrCreate([
    'name' => 'T-shirt Nike Rouge',
    'description' => 'Un magnifique t-shirt Nike de couleur rouge',
    'category_id' => $category1->id,
    'brand_id' => $brand1->id,
    'current_sale_price' => 29.99,
    'available_quantity' => 100,
    'status' => 1,
    'type' => 'simple'
]);

Product::firstOrCreate([
    'name' => 'Smartphone Samsung Galaxy',
    'description' => 'Dernier modèle de smartphone Samsung',
    'category_id' => $category2->id,
    'brand_id' => $brand2->id,
    'current_sale_price' => 599.99,
    'available_quantity' => 50,
    'status' => 1,
    'type' => 'simple'
]);

Product::firstOrCreate([
    'name' => 'Jean Bleu Classique',
    'description' => 'Jean bleu classique et confortable',
    'category_id' => $category1->id,
    'brand_id' => $brand1->id,
    'current_sale_price' => 79.99,
    'available_quantity' => 75,
    'status' => 1,
    'type' => 'simple'
]);

echo "Données de test créées avec succès!\n";
echo "Catégories: " . ProductCategory::count() . "\n";
echo "Marques: " . Brand::count() . "\n";
echo "Couleurs: " . ProductColor::count() . "\n";
echo "Tailles: " . ProductSize::count() . "\n";
echo "Produits: " . Product::count() . "\n";