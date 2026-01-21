<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

use App\Models\Product;

echo "=== Test des attributs produits ===\n\n";

$products = Product::with(['directColors', 'directSizes', 'variants'])->take(3)->get();

foreach ($products as $product) {
    echo "Produit: {$product->name}\n";
    echo "A variants: " . ($product->variants->count() > 0 ? 'Oui' : 'Non') . "\n";
    echo "Couleurs directes: {$product->directColors->count()}\n";
    echo "Tailles directes: {$product->directSizes->count()}\n";
    
    if ($product->directColors->count() > 0) {
        echo "Couleurs: " . $product->directColors->pluck('name')->join(', ') . "\n";
    }
    
    if ($product->directSizes->count() > 0) {
        echo "Tailles: " . $product->directSizes->pluck('size')->join(', ') . "\n";
    }
    
    echo "\n---\n\n";
}