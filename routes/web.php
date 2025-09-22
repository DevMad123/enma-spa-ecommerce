<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Contrôleurs publics
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RealisationsController;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\ContactController;

// Contrôleurs admin
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductCategoryController;
use App\Http\Controllers\Admin\ProductSubcategoryController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\SupplierController;

// Contrôleurs utilisateur
use App\Http\Controllers\ProfileController;

// -------------------
// Routes publiques
// -------------------
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/home-2', [HomeController::class, 'index2'])->name('home-2');
Route::get('/home-3', [HomeController::class, 'index3'])->name('home-3');
Route::get('/realisations', [RealisationsController::class, 'index'])->name('realisations');
Route::get('/a-propos-de-nous', [AboutController::class, 'index'])->name('a-propos-de-nous');
Route::get('/a-propos-de-nous-pro', [AboutController::class, 'indexPro'])->name('a-propos-de-nous-pro');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');

// -------------------
// Routes Admin protégées (InertiaJS)
// -------------------
// Route::middleware(['auth', 'verified', 'isAdmin'])->prefix('admin')->name('admin.')->group(function () {
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard admin
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // CRUD Produits (personnalisé)
    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/create', [ProductController::class, 'createProduct'])->name('create');
        Route::post('/store', [ProductController::class, 'storeProduct'])->name('store');
        Route::get('/list', [ProductController::class, 'productList'])->name('list');
        Route::get('/edit', [ProductController::class, 'productEditDetails'])->name('edit');
        Route::put('/update/{id}', [ProductController::class, 'updateProduct'])->name('update');
        Route::delete('/delete/{id}', [ProductController::class, 'deleteProduct'])->name('delete');
    });

    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/create', [ProductCategoryController::class, 'createCategory'])->name('create');
        Route::post('/store', [ProductCategoryController::class, 'storeCategory'])->name('store');
        Route::get('/list', [ProductCategoryController::class, 'listCategory'])->name('list');
        Route::get('/edit', [ProductCategoryController::class, 'editCategory'])->name('edit');
        Route::put('/update/{id}', [ProductCategoryController::class, 'updateCategory'])->name('update');
        Route::delete('/delete/{id}', [ProductCategoryController::class, 'deleteCategory'])->name('delete');
    });

    Route::prefix('subcategories')->name('subcategories.')->group(function () {
        Route::get('/create', [ProductSubcategoryController::class, 'createSubcategory'])->name('create');
        Route::post('/store', [ProductSubcategoryController::class, 'storeSubcategory'])->name('store');
        Route::get('/', [ProductSubcategoryController::class, 'listSubcategory'])->name('list');
        Route::get('/edit', [ProductSubcategoryController::class, 'editSubcategory'])->name('edit');
        Route::put('/update/{id}', [ProductSubcategoryController::class, 'updateSubcategory'])->name('update');
        Route::delete('/delete/{id}', [ProductSubcategoryController::class, 'deleteSubcategory'])->name('delete');
    });

    Route::prefix('brands')->name('brands.')->group(function () {
        Route::get('/list', [BrandController::class, 'listBrands'])->name('list');
        Route::post('/store', [BrandController::class, 'storeBrands'])->name('store');
        Route::post('/update/{id}', [BrandController::class, 'updateBrands'])->name('update');
        Route::delete('/delete/{id}', [BrandController::class, 'deleteBrands'])->name('delete');
    });

    // CRUD Catégories
    // Route::resource('categories', ProductCategoryController::class);

    // CRUD Sous-catégories
    // Route::resource('subcategories', ProductSubcategoryController::class);

    // Route pour obtenir les sous-catégories par ID de catégorie (AJAX)
    Route::get('subcategories/{category_id}', function ($category_id) {
        return \App\Models\ProductSubCategory::where('category_id', $category_id)
            ->where('status', 1)
            ->whereNull('deleted_at')
            ->get();
    })->name('subcategories.byCategory');

    // CRUD Marques
    Route::resource('brands', BrandController::class);

    // CRUD Fournisseurs
    Route::resource('suppliers', SupplierController::class);

    // ... autres routes admin (commandes, utilisateurs, etc.)
});

// -------------------
// Routes utilisateur protégées
// -------------------
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Auth routes (login, register, etc.)
require __DIR__ . '/auth.php';
