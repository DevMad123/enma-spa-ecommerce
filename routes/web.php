<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Contrôleurs publics
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RealisationsController;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\ContactController;

// Contrôleurs frontend
use App\Http\Controllers\Frontend\ShopController;
use App\Http\Controllers\Frontend\CartController;
use App\Http\Controllers\Frontend\ProfileController as FrontendProfileController;
use App\Http\Controllers\Frontend\ContactController as FrontendContactController;

// Contrôleurs admin
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductCategoryController;
use App\Http\Controllers\Admin\ProductColorController;
use App\Http\Controllers\Admin\ProductSizeController;
use App\Http\Controllers\Admin\ProductSubcategoryController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\SellController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ShippingController;
use App\Http\Controllers\Admin\UserController;

// Contrôleurs utilisateur
use App\Http\Controllers\ProfileController;

// -------------------
// Routes publiques
// -------------------
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/home-2', [HomeController::class, 'index2'])->name('home-2');
Route::get('/home-3', [HomeController::class, 'index3'])->name('home-3');
Route::get('/realisations', [RealisationsController::class, 'index'])->name('realisations');
// Pages About et Contact
Route::get('/a-propos', function () {
    return Inertia::render('Frontend/About');
})->name('a-propos-de-nous');

Route::get('/contact', [FrontendContactController::class, 'index'])->name('contact');
Route::post('/contact', [FrontendContactController::class, 'store'])->name('contact.store');

// -------------------
// Routes Frontend E-commerce
// -------------------
Route::prefix('shop')->name('frontend.shop.')->group(function () {
    Route::get('/', [ShopController::class, 'index'])->name('index');
    Route::get('/category/{category}', [ShopController::class, 'category'])->name('category');
    Route::get('/subcategory/{subcategory}', [ShopController::class, 'subcategory'])->name('subcategory');
    Route::get('/product/{product}', [ShopController::class, 'show'])->name('show');
});

// Routes Panier et Commandes
Route::prefix('cart')->name('frontend.cart.')->group(function () {
    Route::get('/', [CartController::class, 'index'])->name('index');
    Route::get('/checkout', [CartController::class, 'checkout'])->name('checkout');
    Route::post('/checkout', [CartController::class, 'processCheckout'])->name('process');
    Route::get('/success/{sell}', [CartController::class, 'orderSuccess'])->name('success');
});

// API endpoints pour le panier (AJAX)
Route::prefix('api/cart')->name('api.cart.')->group(function () {
    Route::get('/product/{product}', [CartController::class, 'getProductForCart'])->name('product');
});

// Profil Client (Authentification requise)
Route::middleware('auth')->prefix('profile')->name('frontend.profile.')->group(function () {
    Route::get('/', [FrontendProfileController::class, 'index'])->name('index');
    Route::get('/edit', [FrontendProfileController::class, 'edit'])->name('edit');
    Route::put('/update', [FrontendProfileController::class, 'update'])->name('update');
    Route::get('/orders', [FrontendProfileController::class, 'orders'])->name('orders');
    Route::get('/orders/{order}', [FrontendProfileController::class, 'orderDetails'])->name('order.details');
    Route::get('/addresses', [FrontendProfileController::class, 'addresses'])->name('addresses');
});

// Redirection ordre vers succès
Route::get('/order/success/{sell}', [CartController::class, 'orderSuccess'])->name('frontend.order.success');

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
        Route::post('/store', [BrandController::class, 'storeBrands'])->name('storeBrands');
        Route::put('/update/{id}', [BrandController::class, 'updateBrands'])->name('updateBrands');
        Route::delete('/delete/{id}', [BrandController::class, 'deleteBrands'])->name('deleteBrands');
    });

    Route::prefix('suppliers')->name('suppliers.')->group(function () {
        Route::get('/list', [SupplierController::class, 'listSuppliers'])->name('list');
        Route::post('/store', [SupplierController::class, 'storeSuppliers'])->name('storeSuppliers');
        Route::put('/update/{id}', [SupplierController::class, 'updateSuppliers'])->name('updateSuppliers');
        Route::delete('/delete/{id}', [SupplierController::class, 'deleteSuppliers'])->name('deleteSuppliers');
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
    // Route::resource('brands', BrandController::class);

    // // CRUD Fournisseurs
    // Route::resource('suppliers', SupplierController::class);

    // Routes pour les couleurs
    Route::prefix('colors')->name('colors.')->group(function () {
        Route::get('/', [ProductColorController::class, 'listColors'])->name('list');
        Route::post('/', [ProductColorController::class, 'storeColors'])->name('storeColors');
        Route::put('/{id}', [ProductColorController::class, 'updateColors'])->name('updateColors');
        Route::delete('/{id}', [ProductColorController::class, 'deleteColors'])->name('deleteColors');
    });

    // Routes pour les tailles
    Route::prefix('sizes')->name('sizes.')->group(function () {
        Route::get('/', [ProductSizeController::class, 'listSizes'])->name('list');
        Route::post('/', [ProductSizeController::class, 'storeSizes'])->name('storeSizes');
        Route::put('/{id}', [ProductSizeController::class, 'updateSizes'])->name('updateSizes');
        Route::delete('/{id}', [ProductSizeController::class, 'deleteSizes'])->name('deleteSizes');
    });

    // Routes pour les clients
    Route::prefix('customers')->name('customers.')->group(function () {
        Route::get('/', [CustomerController::class, 'index'])->name('index');
        Route::get('/export/csv', [CustomerController::class, 'export'])->name('export');
        Route::post('/', [CustomerController::class, 'store'])->name('store');
        Route::get('/{id}', [CustomerController::class, 'show'])->name('show');
        Route::put('/{id}', [CustomerController::class, 'update'])->name('update');
        Route::delete('/{id}', [CustomerController::class, 'destroy'])->name('destroy');
    });

    // Routes pour les commandes (Orders/Sells)
    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [SellController::class, 'index'])->name('index');
        Route::get('/create', [SellController::class, 'create'])->name('create');
        Route::post('/', [SellController::class, 'store'])->name('store');
        Route::get('/export/csv', [SellController::class, 'export'])->name('export');
        Route::get('/search-products', [SellController::class, 'searchProducts'])->name('searchProducts');
        Route::get('/{sell}', [SellController::class, 'show'])->name('show');
        Route::get('/{sell}/edit', [SellController::class, 'edit'])->name('edit');
        Route::put('/{sell}', [SellController::class, 'update'])->name('update');
        Route::delete('/{sell}', [SellController::class, 'destroy'])->name('destroy');
        Route::patch('/{sell}/status', [SellController::class, 'updateStatus'])->name('updateStatus');
        Route::get('/{sell}/invoice', [SellController::class, 'downloadInvoice'])->name('downloadInvoice');
    });

    // Routes Paiements
    Route::prefix('payments')->name('payments.')->group(function () {
        Route::get('/', [PaymentController::class, 'index'])->name('index');
        Route::get('/create', [PaymentController::class, 'create'])->name('create');
        Route::post('/', [PaymentController::class, 'store'])->name('store');
        Route::get('/export/csv', [PaymentController::class, 'export'])->name('export');
        Route::get('/{payment}', [PaymentController::class, 'show'])->name('show');
        Route::get('/{payment}/edit', [PaymentController::class, 'edit'])->name('edit');
        Route::put('/{payment}', [PaymentController::class, 'update'])->name('update');
        Route::delete('/{payment}', [PaymentController::class, 'destroy'])->name('destroy');
        Route::patch('/{payment}/validate', [PaymentController::class, 'validatePayment'])->name('validate');
        Route::patch('/{payment}/reject', [PaymentController::class, 'reject'])->name('reject');
        Route::patch('/{payment}/refund', [PaymentController::class, 'refund'])->name('refund');
    });

    // Routes Modes de livraison
    Route::prefix('shippings')->name('shippings.')->group(function () {
        Route::get('/', [ShippingController::class, 'index'])->name('index');
        Route::get('/create', [ShippingController::class, 'create'])->name('create');
        Route::post('/', [ShippingController::class, 'store'])->name('store');
        Route::get('/active', [ShippingController::class, 'getActiveShippings'])->name('active');
        Route::get('/{shipping}', [ShippingController::class, 'show'])->name('show');
        Route::get('/{shipping}/edit', [ShippingController::class, 'edit'])->name('edit');
        Route::put('/{shipping}', [ShippingController::class, 'update'])->name('update');
        Route::delete('/{shipping}', [ShippingController::class, 'destroy'])->name('destroy');
        Route::patch('/{shipping}/toggle', [ShippingController::class, 'toggleStatus'])->name('toggle');
        Route::put('/sort-order', [ShippingController::class, 'updateSortOrder'])->name('updateSortOrder');
    });

    // Routes Utilisateurs et Rôles (Admin et Manager seulement)
    Route::prefix('users')->name('users.')->middleware(['hasAnyRole:admin,manager'])->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('/create', [UserController::class, 'create'])->name('create');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/{user}', [UserController::class, 'show'])->name('show');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
        Route::put('/{user}', [UserController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->middleware(['hasRole:admin'])->name('destroy');
        Route::patch('/{user}/toggle-status', [UserController::class, 'toggleStatus'])->middleware(['hasRole:admin'])->name('toggleStatus');
    });
});

// Auth routes (login, register, etc.)
require __DIR__ . '/auth.php';
