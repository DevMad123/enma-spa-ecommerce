<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Brand;
use App\Models\ProductColor;
use App\Models\ProductSize;
use App\Models\Wishlist;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'colors', 'sizes'])
            ->where('status', 1);

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('brand', function($brandQuery) use ($search) {
                      $brandQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filtre par catégorie
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        // Filtre par catégories multiples
        if ($request->filled('categories')) {
            $categories = is_array($request->categories) ? $request->categories : [$request->categories];
            $query->whereIn('category_id', $categories);
        }

        // Filtre par marque
        if ($request->filled('brand')) {
            $query->where('brand_id', $request->brand);
        }

        // Filtre par marques multiples
        if ($request->filled('brands')) {
            $brands = is_array($request->brands) ? $request->brands : [$request->brands];
            $query->whereIn('brand_id', $brands);
        }

        // Filtre par couleurs
        if ($request->filled('colors')) {
            $colors = is_array($request->colors) ? $request->colors : [$request->colors];
            $query->whereHas('colors', function($colorQuery) use ($colors) {
                $colorQuery->whereIn('product_colors.id', $colors);
            });
        }

        // Filtre par tailles
        if ($request->filled('sizes')) {
            $sizes = is_array($request->sizes) ? $request->sizes : [$request->sizes];
            $query->whereHas('sizes', function($sizeQuery) use ($sizes) {
                $sizeQuery->whereIn('product_sizes.id', $sizes);
            });
        }

        // Filtre par prix
        if ($request->filled('min_price')) {
            $query->where('current_sale_price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('current_sale_price', '<=', $request->max_price);
        }

        // Tri
        switch ($request->get('sort', 'newest')) {
            case 'price_asc':
                $query->orderBy('current_sale_price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('current_sale_price', 'desc');
                break;
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            case 'popular':
                $query->orderBy('is_popular', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $products = $query->paginate(12)->withQueryString();

        // Données pour les filtres
        $categories = ProductCategory::where('status', 1)->get();
        $brands = Brand::where('status', 1)->get();
        $colors = ProductColor::all();
        $sizes = ProductSize::all();

        // Statistiques prix pour le filtre
        $priceRange = Product::where('status', 1)
            ->selectRaw('MIN(current_sale_price) as min_price, MAX(current_sale_price) as max_price')
            ->first();

        // Nettoyage des filtres pour éviter les valeurs null
        $filters = collect($request->only([
            'search', 'category', 'categories', 
            'brand', 'brands', 'colors', 'sizes', 'min_price', 'max_price', 'sort'
        ]))
            ->filter(function ($value) {
                return $value !== null && $value !== '' && !empty($value);
            })
            ->toArray();

        return Inertia::render('Frontend/Shop/Index', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'colors' => $colors,
            'sizes' => $sizes,
            'priceRange' => $priceRange,
            'filters' => $filters,
        ]);
    }

    public function category($categoryId, Request $request)
    {
        $category = ProductCategory::where('id', $categoryId)->firstOrFail();
        
        $query = Product::with(['category', 'brand', 'colors', 'sizes'])
            ->where('category_id', $category->id)
            ->where('status', 1);

        // Appliquer les mêmes filtres que dans index()
        $this->applyFilters($query, $request);

        $products = $query->paginate(12)->withQueryString();
        
        $brands = Brand::where('status', 1)->get();
        $colors = ProductColor::all();
        $sizes = ProductSize::all();

        return Inertia::render('Frontend/Shop/Category', [
            'category' => $category,
            'products' => $products,
            'brands' => $brands,
            'colors' => $colors,
            'sizes' => $sizes,
            'filters' => $request->only(['brand', 'brands', 'colors', 'sizes', 'min_price', 'max_price', 'sort']),
        ]);
    }

    public function show($productId)
    {
        $product = Product::with([
            'category', 
            // 'subcategory', // Table product_sub_categories n'existe pas
            'brand', 
            'supplier',
            'variants.color',
            'variants.size', 
            'variants.images',
            'images',
            // Charger les relations directes pour produits simples
            'directColors',
            'directSizes',
            // Charger les relations variants pour produits variables  
            'variantColors',
            'variantSizes'
        ])->findOrFail($productId);

        // Déterminer les couleurs et tailles finales selon le type de produit
        if ($product->variants()->exists()) {
            // Produit variable : utiliser les couleurs/tailles des variants
            $colors = $product->variantColors;
            $sizes = $product->variantSizes;
        } else {
            // Produit simple : utiliser les relations directes
            $colors = $product->directColors;
            $sizes = $product->directSizes;
        }
        
        // Ajouter les données dans l'objet product pour le frontend
        $product->colors = $colors;
        $product->sizes = $sizes;

        // Récupérer les avis du produit avec les utilisateurs
        $reviews = \App\Models\ProductReview::with(['user'])
            ->where('product_id', $product->id)
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($review) {
                return [
                    'id' => $review->id,
                    'user_id' => $review->user_id,
                    'product_id' => $review->product_id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'is_approved' => $review->is_approved,
                    'is_verified_purchase' => $review->is_verified_purchase ?? false,
                    'helpful_count' => $review->helpful_count ?? 0,
                    'created_at' => $review->created_at->format('d/m/Y'),
                    'updated_at' => $review->updated_at->format('d/m/Y'),
                    'user' => [
                        'id' => $review->user->id,
                        'name' => $review->user->name,
                        'email' => $review->user->email,
                    ]
                ];
            });

        // Vérifier si l'utilisateur connecté peut laisser un avis
        $userCanReview = false;
        if (auth()->check()) {
            // L'utilisateur peut laisser un avis s'il n'en a pas déjà laissé un
            $userCanReview = !\App\Models\ProductReview::where('product_id', $product->id)
                ->where('user_id', auth()->id())
                ->exists();
        }

        // Produits similaires (même catégorie)
        $relatedProducts = Product::with(['category', 'brand'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', 1)
            ->limit(4)
            ->get();

        return Inertia::render('Frontend/Shop/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'reviews' => $reviews,
            'userCanReview' => $userCanReview,
            'wishlist' => auth()->check() ? auth()->user()->wishlistItems()->pluck('product_id')->toArray() : [],
        ]);
    }

    private function applyFilters($query, $request)
    {
        // Filtre par marque
        if ($request->filled('brand')) {
            $query->where('brand_id', $request->brand);
        }

        // Filtre par marques multiples
        if ($request->filled('brands')) {
            $brands = is_array($request->brands) ? $request->brands : [$request->brands];
            $query->whereIn('brand_id', $brands);
        }

        // Filtre par couleurs
        if ($request->filled('colors')) {
            $colors = is_array($request->colors) ? $request->colors : [$request->colors];
            $query->whereHas('colors', function($colorQuery) use ($colors) {
                $colorQuery->whereIn('product_colors.id', $colors);
            });
        }

        // Filtre par tailles
        if ($request->filled('sizes')) {
            $sizes = is_array($request->sizes) ? $request->sizes : [$request->sizes];
            $query->whereHas('sizes', function($sizeQuery) use ($sizes) {
                $sizeQuery->whereIn('product_sizes.id', $sizes);
            });
        }

        // Filtre par prix
        if ($request->filled('min_price')) {
            $query->where('current_sale_price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('current_sale_price', '<=', $request->max_price);
        }

        // Tri
        switch ($request->get('sort', 'newest')) {
            case 'price_asc':
                $query->orderBy('current_sale_price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('current_sale_price', 'desc');
                break;
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            case 'popular':
                $query->orderBy('is_popular', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }
    }
}
