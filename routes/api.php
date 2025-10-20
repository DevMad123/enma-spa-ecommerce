<?php

use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductCategoryController;
use App\Http\Controllers\Api\ProductSubcategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\CustomizationController;
use App\Http\Controllers\Api\MenuController;

// Authentification publique
// Route::post('/signup', [AuthController::class, 'signup']);
// Route::post('/login', [AuthController::class, 'login']);
// Route::get('/dashboard', [DashboardController::class, 'index']);
// Routes protégées par Sanctum (utilisateur connecté)
// Route::middleware('auth:sanctum')->group(function () {
//     Route::post('/logout', [AuthController::class, 'logout']);
//     Route::post('/user/changePassword', [AuthController::class, 'changePassword']);
//     // Route::get('/dashboard', [DashboardController::class, 'index']);
// });

// API produits (affichage, détails)
// Route::prefix('products')->group(function () {
//     Route::get('/', [ProductController::class, 'index']); // Liste des produits
//     Route::get('/{id}', [ProductController::class, 'show']); // Détail produit
// });

// // API catégories
// Route::prefix('categories')->group(function () {
//     Route::get('/', [ProductCategoryController::class, 'index']); // Liste des catégories
//     Route::get('/{id}', [ProductCategoryController::class, 'show']); // Détail catégorie
// });

// // API sous-catégories
// Route::prefix('subcategories')->group(function () {
//     Route::get('/', [ProductSubcategoryController::class, 'index']); // Liste des sous-catégories
//     Route::get('/{id}', [ProductSubcategoryController::class, 'show']); // Détail sous-catégorie
// });

// // API marques
// Route::prefix('brands')->group(function () {
//     Route::get('/', [BrandController::class, 'index']); // Liste des marques
//     Route::get('/{id}', [BrandController::class, 'show']); // Détail marque
// });

// ============================================================
// 🎯 ROUTES API : WISHLIST & AVIS PRODUITS
// ============================================================

/*
|--------------------------------------------------------------------------
| 👀 Routes Publiques - Avis Produits  
|--------------------------------------------------------------------------
| Consultation des avis sans authentification requise
*/

// Avis d'un produit spécifique (consultation publique)
Route::get('/products/{productId}/reviews', [ReviewController::class, 'index'])
    ->name('api.reviews.product')
    ->where('productId', '[0-9]+');

// Statistiques des avis d'un produit (résumé public)
Route::get('/products/{productId}/reviews/summary', [ReviewController::class, 'summary'])
    ->name('api.reviews.summary')
    ->where('productId', '[0-9]+');

/*
|--------------------------------------------------------------------------
| 🔐 Routes Protégées - Authentification Sanctum Requise
|--------------------------------------------------------------------------
| Toutes les actions utilisateur nécessitent une authentification
*/

Route::middleware(['auth:sanctum'])->group(function () {
    
    /*
    |--------------------------------------------------------------------------
    | 💝 Wishlist API - Gestion Liste de Souhaits
    |--------------------------------------------------------------------------
    */
    Route::prefix('wishlist')->name('api.wishlist.')->group(function () {
        // Consultation de ma wishlist
        Route::get('/', [WishlistController::class, 'index'])
            ->name('index');
        
        // Actions sur les produits
        Route::post('/toggle', [WishlistController::class, 'toggle'])
            ->name('toggle'); // Ajouter/Retirer intelligemment
        Route::post('/add', [WishlistController::class, 'store'])
            ->name('store'); // Ajouter explicitement
        Route::delete('/remove/{productId}', [WishlistController::class, 'destroy'])
            ->name('destroy')
            ->where('productId', '[0-9]+');
        
        // Vérifications et utilitaires
        Route::post('/check', [WishlistController::class, 'check'])
            ->name('check'); // Vérifier plusieurs produits à la fois
        Route::get('/check/{productId}', [WishlistController::class, 'checkSingle'])
            ->name('check.single')
            ->where('productId', '[0-9]+');
        
        // Gestion globale
        Route::delete('/clear', [WishlistController::class, 'clear'])
            ->name('clear');
        Route::get('/count', [WishlistController::class, 'count'])
            ->name('count');
    });
    
    /*
    |--------------------------------------------------------------------------
    | 💬 Reviews API - Gestion des Avis Produits
    |--------------------------------------------------------------------------
    */
    Route::prefix('reviews')->name('api.reviews.')->group(function () {
        // Mes avis personnels
        Route::get('/my-reviews', [ReviewController::class, 'myReviews'])
            ->name('my-reviews');
        Route::get('/my-reviews/stats', [ReviewController::class, 'myStats'])
            ->name('my-stats');
        
        // CRUD des avis
        Route::post('/', [ReviewController::class, 'store'])
            ->name('store');
        Route::get('/{review}', [ReviewController::class, 'show'])
            ->name('show')
            ->where('review', '[0-9]+');
        Route::put('/{review}', [ReviewController::class, 'update'])
            ->name('update')
            ->where('review', '[0-9]+');
        Route::patch('/{review}', [ReviewController::class, 'update'])
            ->name('patch')
            ->where('review', '[0-9]+');
        Route::delete('/{review}', [ReviewController::class, 'destroy'])
            ->name('destroy')
            ->where('review', '[0-9]+');
        
        // Actions spéciales
        Route::post('/{review}/helpful', [ReviewController::class, 'markHelpful'])
            ->name('helpful')
            ->where('review', '[0-9]+');
        Route::post('/{review}/report', [ReviewController::class, 'report'])
            ->name('report')
            ->where('review', '[0-9]+');
    });
    
    /*
    |--------------------------------------------------------------------------
    | � Intégrations E-commerce
    |--------------------------------------------------------------------------
    */
    
    // Vérifier si l'utilisateur peut laisser un avis (a acheté le produit)
    Route::get('/products/{productId}/can-review', [ReviewController::class, 'canReview'])
        ->name('api.products.can-review')
        ->where('productId', '[0-9]+');
    
    // Actions combinées (wishlist + produit)
    Route::post('/products/{productId}/wishlist-toggle', [WishlistController::class, 'productToggle'])
        ->name('api.products.wishlist-toggle')
        ->where('productId', '[0-9]+');
});

/*
|--------------------------------------------------------------------------
| Routes publiques pour les règles de TVA
|--------------------------------------------------------------------------
*/
Route::prefix('countries')->name('api.countries.')->group(function () {
    Route::get('/tax-rules', function () {
        return \App\Models\TaxRule::active()
            ->deliveryAllowed()
            ->orderBy('country_name')
            ->get(['country_code', 'country_name', 'tax_rate', 'delivery_allowed', 'min_order_amount', 'is_active', 'is_default']);
    })->name('tax-rules');
});

// Public API: front customizations
Route::get('/customizations', [CustomizationController::class, 'show'])->name('api.customizations.show');
// Public API: menu categories
Route::get('/menu/categories', [MenuController::class, 'categories'])->name('api.menu.categories');
