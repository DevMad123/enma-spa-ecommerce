<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\FrontCustomization;
use App\Models\FrontGalleryItem;
use App\Models\Brand;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Schema;

class HomeController extends Controller
{
    public function index()
    {
        if (!Schema::hasTable('products')) {
            return inertia('Frontend/Home', [
                'featuredProducts' => [],
                'newProducts' => [],
                'bestSellers' => [],
                'categories' => [],
                'brands' => [],
                'wishlist' => [],
            ]);
        }
        // Produits mis en avant
        $featuredProducts = Product::with(['category', 'brand'])
            ->where('status', 1)
            ->where('is_popular', 1)
            ->limit(8)
            ->get();

        // Nouveautés
        $newProducts = Product::with(['category', 'brand'])
            ->where('status', 1)
            ->orderBy('created_at', 'desc')
            ->limit(12)
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

        // Galerie lifestyle (section 8)
        $galleryItems = FrontGalleryItem::where('enabled', true)
            ->orderBy('order')
            ->limit(6)
            ->get()
            ->map(function ($g) {
                return [
                    'id' => $g->id,
                    'title' => $g->title,
                    'url' => $g->url,
                    'image' => $g->image_url,
                ];
            });

        // Catégorie mise en avant (section 6)
        $custom = FrontCustomization::select(['featured_category_id'])->first();
        $featuredCategory = null;
        $featuredCategoryProducts = collect();
        if ($custom && $custom->featured_category_id) {
            $featuredCategory = ProductCategory::find($custom->featured_category_id);
            if ($featuredCategory) {
                $featuredCategoryProducts = Product::with(['category', 'brand'])
                    ->where('status', 1)
                    ->where('category_id', $featuredCategory->id)
                    ->orderBy('created_at', 'desc')
                    ->limit(12)
                    ->get();
            }
        }

        return Inertia::render('Frontend/Home', [
            'featuredProducts' => $featuredProducts,
            'newProducts' => $newProducts,
            'bestSellers' => $bestSellers,
            'categories' => $categories,
            'brands' => $brands,
            'galleryItems' => $galleryItems,
            'featuredCategory' => $featuredCategory,
            'featuredCategoryProducts' => $featuredCategoryProducts,
            'wishlist' => auth()->check() ? auth()->user()->wishlistItems()->pluck('product_id')->toArray() : [],
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
