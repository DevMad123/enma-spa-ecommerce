<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        // Produits mis en avant
        $featuredProducts = Product::with(['category', 'brand'])
            ->where('status', 1)
            ->where('is_popular', 1)
            ->limit(8)
            ->get();

        // Nouveautés
        $newProducts = Product::with(['category', 'brand'])
            ->where('status', 1)
            ->where('is_trending', 1)
            ->limit(4)
            ->get();

        // Meilleures ventes
        $bestSellers = Product::with(['category', 'brand'])
            ->where('status', 1)
            ->where('is_popular', 1)
            ->limit(4)
            ->get();

        // Catégories principales
        $categories = ProductCategory::where('status', 1)
            ->limit(6)
            ->get();

        // Marques populaires
        $brands = Brand::where('status', 1)
            ->limit(8)
            ->get();

        return Inertia::render('Frontend/Home', [
            'featuredProducts' => $featuredProducts,
            'newProducts' => $newProducts,
            'bestSellers' => $bestSellers,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    public function index2()
    {
        return inertia('front/Home-2');
    }

    public function index3()
    {
        return inertia('front/Home-3');
    }
}
