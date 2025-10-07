<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Frontend\WishlistController;

// Contrôleurs publics
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RealisationsController;
use App\Http\Controllers\ReviewController;

// Contrôleurs frontend
use App\Http\Controllers\Frontend\ShopController;
use App\Http\Controllers\Frontend\CartController;
use App\Http\Controllers\Frontend\ProfileController as FrontendProfileController;
use App\Http\Controllers\Frontend\ContactController as FrontendContactController;
use App\Http\Controllers\Frontend\NewsletterController;

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
use App\Http\Controllers\Admin\ContactMessageController;
use App\Http\Controllers\Admin\NewsletterController as AdminNewsletterController;

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

// Routes Newsletter
Route::prefix('newsletter')->name('newsletter.')->group(function () {
    Route::post('/subscribe', [NewsletterController::class, 'subscribe'])->name('subscribe');
    Route::post('/unsubscribe', [NewsletterController::class, 'unsubscribe'])->name('unsubscribe');
    Route::post('/check', [NewsletterController::class, 'checkSubscription'])->name('check');
});

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

// Routes Wishlist
Route::middleware('auth')->prefix('wishlist')->name('frontend.wishlist.')->group(function () {
    Route::get('/', [WishlistController::class, 'index'])->name('index');
    Route::post('/add', [WishlistController::class, 'store'])->name('store');
    Route::delete('/remove/{productId}', [WishlistController::class, 'destroy'])->name('destroy');
    Route::delete('/clear', [WishlistController::class, 'clear'])->name('clear');
});

// Routes Reviews (Authentification requise pour création/modification/suppression)
Route::prefix('reviews')->name('frontend.reviews.')->group(function () {
    // Ajouter un avis (authentification requise)
    Route::middleware('auth')->post('/', [ReviewController::class, 'store'])->name('store');

    // Modifier un avis (authentification requise + ownership)
    Route::middleware('auth')->put('/{review}', [ReviewController::class, 'update'])->name('update');

    // Supprimer un avis (authentification requise + ownership)
    Route::middleware('auth')->delete('/{review}', [ReviewController::class, 'destroy'])->name('destroy');

    // Marquer un avis comme utile (authentification requise)
    Route::middleware('auth')->post('/{review}/helpful', [ReviewController::class, 'markHelpful'])->name('helpful');

    // Signaler un avis (authentification requise)
    Route::middleware('auth')->post('/{review}/report', [ReviewController::class, 'report'])->name('report');
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
        Route::get('/', [ProductController::class, 'index'])->name('index');
        Route::get('/create', [ProductController::class, 'createProduct'])->name('create');
        Route::post('/', [ProductController::class, 'store'])->name('store');
        Route::get('/{product}', [ProductController::class, 'show'])->name('show');
        Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('edit');
        Route::put('/{product}', [ProductController::class, 'update'])->name('update');
        Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
        Route::get('/edit', [ProductController::class, 'productEditDetails'])->name('editDetails');

        // Route pour obtenir les sous-catégories par catégorie (AJAX)
        Route::get('/subcategories/{category_id}', [ProductController::class, 'getSubcategoriesByCategory'])->name('subcategories.byCategory');
    });

    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [ProductCategoryController::class, 'index'])->name('index');
        Route::get('/create', [ProductCategoryController::class, 'create'])->name('create');
        Route::post('/store', [ProductCategoryController::class, 'store'])->name('store');
        Route::get('/{category}', [ProductCategoryController::class, 'show'])->name('show');
        Route::get('/{category}/edit', [ProductCategoryController::class, 'edit'])->name('edit');
        Route::put('/update/{id}', [ProductCategoryController::class, 'update'])->name('update');
        Route::delete('/delete/{id}', [ProductCategoryController::class, 'delete'])->name('delete');
    });

    Route::prefix('subcategories')->name('subcategories.')->group(function () {
        Route::get('/', [ProductSubcategoryController::class, 'index'])->name('index');
        Route::get('/create', [ProductSubcategoryController::class, 'create'])->name('create');
        Route::post('/', [ProductSubcategoryController::class, 'store'])->name('store');
        Route::get('/{subcategory}', [ProductSubcategoryController::class, 'show'])->name('show');
        Route::get('/{subcategory}/edit', [ProductSubcategoryController::class, 'edit'])->name('edit');
        Route::put('/{subcategory}', [ProductSubcategoryController::class, 'update'])->name('update');
        Route::delete('/{subcategory}', [ProductSubcategoryController::class, 'delete'])->name('destroy');

        // Legacy routes for backward compatibility
        Route::post('/store', [ProductSubcategoryController::class, 'storeSubcategory'])->name('store.legacy');
        Route::put('/update/{id}', [ProductSubcategoryController::class, 'updateSubcategory'])->name('update.legacy');
        Route::delete('/delete/{id}', [ProductSubcategoryController::class, 'deleteSubcategory'])->name('delete.legacy');
    });

    Route::prefix('brands')->name('brands.')->group(function () {
        // Routes REST modernes
        Route::get('/', [BrandController::class, 'index'])->name('index');
        Route::get('/create', [BrandController::class, 'create'])->name('create');
        Route::post('/', [BrandController::class, 'store'])->name('store');
        Route::get('/{brand}', [BrandController::class, 'show'])->name('show');
        Route::get('/{brand}/edit', [BrandController::class, 'edit'])->name('edit');
        Route::put('/{brand}', [BrandController::class, 'update'])->name('update');
        Route::delete('/{brand}', [BrandController::class, 'destroy'])->name('destroy');
        Route::post('/bulk-delete', [BrandController::class, 'bulkDelete'])->name('bulk-delete');
        
        // Routes legacy pour compatibilité (temporaires)
        Route::get('/list', [BrandController::class, 'index'])->name('list');
        Route::post('/store', [BrandController::class, 'store'])->name('storeBrands');
        Route::put('/update/{id}', [BrandController::class, 'update'])->name('updateBrands');
        Route::delete('/delete/{id}', [BrandController::class, 'destroy'])->name('deleteBrands');
    });

    Route::prefix('suppliers')->name('suppliers.')->group(function () {
        // Routes REST modernes
        Route::get('/', [SupplierController::class, 'index'])->name('index');
        Route::get('/create', [SupplierController::class, 'create'])->name('create');
        Route::post('/', [SupplierController::class, 'store'])->name('store');
        Route::get('/{supplier}', [SupplierController::class, 'show'])->name('show');
        Route::get('/{supplier}/edit', [SupplierController::class, 'edit'])->name('edit');
        Route::put('/{supplier}', [SupplierController::class, 'update'])->name('update');
        Route::delete('/{supplier}', [SupplierController::class, 'destroy'])->name('destroy');
        
        // Routes legacy pour compatibilité (temporaires)
        Route::get('/list', [SupplierController::class, 'index'])->name('list');
        Route::post('/store', [SupplierController::class, 'store'])->name('storeSuppliers');
        Route::put('/update/{id}', [SupplierController::class, 'update'])->name('updateSuppliers');
        Route::delete('/delete/{id}', [SupplierController::class, 'destroy'])->name('deleteSuppliers');
    });

    // Route supprimée - utilise admin.products.subcategories.byCategory dans le ProductController

    // Routes pour les couleurs
    Route::prefix('colors')->name('colors.')->group(function () {
        Route::get('/', [ProductColorController::class, 'index'])->name('index');
        Route::get('/create', [ProductColorController::class, 'create'])->name('create');
        Route::post('/', [ProductColorController::class, 'store'])->name('store');
        Route::get('/{color}', [ProductColorController::class, 'show'])->name('show');
        Route::get('/{color}/edit', [ProductColorController::class, 'edit'])->name('edit');
        Route::put('/{color}', [ProductColorController::class, 'update'])->name('update');
        Route::delete('/{color}', [ProductColorController::class, 'destroy'])->name('destroy');

        // Routes legacy pour le modal existant
        Route::post('/storeColors', [ProductColorController::class, 'storeColors'])->name('storeColors');
        Route::put('/updateColors/{id}', [ProductColorController::class, 'updateColors'])->name('updateColors');
        Route::delete('/deleteColors/{id}', [ProductColorController::class, 'deleteColors'])->name('deleteColors');
    });

    // Routes pour les tailles
    Route::prefix('sizes')->name('sizes.')->group(function () {
        Route::get('/', [ProductSizeController::class, 'index'])->name('index');
        Route::get('/create', [ProductSizeController::class, 'create'])->name('create');
        Route::post('/', [ProductSizeController::class, 'store'])->name('store');
        Route::get('/{size}', [ProductSizeController::class, 'show'])->name('show');
        Route::get('/{size}/edit', [ProductSizeController::class, 'edit'])->name('edit');
        Route::put('/{size}', [ProductSizeController::class, 'update'])->name('update');
        Route::delete('/{size}', [ProductSizeController::class, 'destroy'])->name('destroy');

        // Routes legacy pour le modal existant
        Route::post('/storeSizes', [ProductSizeController::class, 'storeSizes'])->name('storeSizes');
        Route::put('/updateSizes/{id}', [ProductSizeController::class, 'updateSizes'])->name('updateSizes');
        Route::delete('/deleteSizes/{id}', [ProductSizeController::class, 'deleteSizes'])->name('deleteSizes');
    });

    // Routes pour les clients
    Route::prefix('customers')->name('customers.')->group(function () {
        Route::get('/', [CustomerController::class, 'index'])->name('index');
        Route::get('/create', [CustomerController::class, 'create'])->name('create');
        Route::get('/export/csv', [CustomerController::class, 'export'])->name('export');
        Route::post('/', [CustomerController::class, 'store'])->name('store');
        Route::get('/{customer}/edit', [CustomerController::class, 'edit'])->name('edit');
        Route::get('/{customer}', [CustomerController::class, 'show'])->name('show');
        Route::put('/{customer}', [CustomerController::class, 'update'])->name('update');
        Route::delete('/{customer}', [CustomerController::class, 'destroy'])->name('destroy');

        // Actions groupées
        Route::post('/bulk-delete', [CustomerController::class, 'bulkDelete'])->name('bulk-delete');
        Route::post('/bulk-activate', [CustomerController::class, 'bulkActivate'])->name('bulk-activate');
        Route::post('/bulk-deactivate', [CustomerController::class, 'bulkDeactivate'])->name('bulk-deactivate');
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
        Route::post('/bulk-delete', [PaymentController::class, 'bulkDelete'])->name('bulk-delete');
        Route::post('/bulk-validate', [PaymentController::class, 'bulkValidate'])->name('bulk-validate');
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
        Route::get('/export/csv', [ShippingController::class, 'export'])->name('export');
        Route::post('/bulk-delete', [ShippingController::class, 'bulkDelete'])->name('bulk-delete');
        Route::post('/bulk-activate', [ShippingController::class, 'bulkActivate'])->name('bulk-activate');
        Route::post('/bulk-deactivate', [ShippingController::class, 'bulkDeactivate'])->name('bulk-deactivate');
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
        Route::get('/export', [UserController::class, 'export'])->name('export');
        Route::get('/{user}', [UserController::class, 'show'])->name('show');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
        Route::put('/{user}', [UserController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->middleware(['hasRole:admin'])->name('destroy');
        Route::patch('/{user}/toggle-status', [UserController::class, 'toggleStatus'])->middleware(['hasRole:admin'])->name('toggleStatus');
    });

    // Routes Messages de Contact
    Route::prefix('contact-messages')->name('contact-messages.')->group(function () {
        Route::get('/', [ContactMessageController::class, 'index'])->name('index');
        Route::get('/{contactMessage}', [ContactMessageController::class, 'show'])->name('show');
        Route::put('/{contactMessage}', [ContactMessageController::class, 'update'])->name('update');
        Route::delete('/{contactMessage}', [ContactMessageController::class, 'destroy'])->name('destroy');
        Route::post('/bulk-action', [ContactMessageController::class, 'bulkAction'])->name('bulk-action');
    });

    // Routes Newsletter
    Route::prefix('newsletters')->name('newsletters.')->group(function () {
        Route::get('/', [AdminNewsletterController::class, 'index'])->name('index');
        Route::delete('/{newsletter}', [AdminNewsletterController::class, 'destroy'])->name('destroy');
        Route::post('/bulk-delete', [AdminNewsletterController::class, 'bulkDelete'])->name('bulk-delete');
        Route::get('/export', [AdminNewsletterController::class, 'export'])->name('export');
        Route::get('/statistics', [AdminNewsletterController::class, 'statistics'])->name('statistics');
    });
});

// Auth routes (login, register, etc.)
require __DIR__ . '/auth.php';
