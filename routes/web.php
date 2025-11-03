<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Frontend\WishlistController;
use App\Http\Controllers\TestPricingController;

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
use App\Http\Controllers\Admin\PaymentMethodController;
use App\Http\Controllers\PayPalPaymentController;
use App\Http\Controllers\Admin\ShippingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ContactMessageController;
use App\Http\Controllers\Admin\NewsletterController as AdminNewsletterController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\FrontCustomizationController;

// Contrôleurs paiement
use App\Http\Controllers\OrangeMoneyPaymentController;
use App\Http\Controllers\WavePaymentController;

// Contrôleurs utilisateur
use App\Http\Controllers\ProfileController;

if (app()->environment('local')) {
// Route de test pour les paramètres
Route::get('/test-settings', function () {
    return view('test-settings');
})->name('test-settings');

// Route de test pour l'API des paramètres
Route::get('/test-settings-api', function () {
    return view('test-settings-api');
})->name('test-settings-api');

// Route de debug pour les paramètres
Route::get('/test-settings-debug', function () {
    return view('test-settings-debug');
})->name('test-settings-debug');

// Route de test final pour les paramètres
Route::get('/test-settings-final', function () {
    return view('test-settings-final');
})->name('test-settings-final');

// Route de test pour simuler un upload réussi
Route::get('/simulate-upload-success', function () {
    return redirect()->route('admin.settings.test-messages')->with('upload_success', [
        'message' => 'Test de fichier uploadé avec succès !',
        'path' => 'settings/test.jpg',
        'url' => '/storage/settings/test.jpg',
        'filename' => 'test.jpg'
    ]);
})->name('simulate-upload-success');

// Route pour simuler un upload vers la page principale
Route::get('/simulate-upload-to-settings', function () {
    return redirect()->route('admin.settings.index')->with('upload_success', [
        'message' => 'Test de fichier uploadé avec succès !',
        'path' => 'settings/test.jpg',
        'url' => '/storage/settings/test.jpg',
        'filename' => 'test.jpg'
    ]);
})->name('simulate-upload-to-settings');
}

Route::get('/', [HomeController::class, 'index'])->name('home');
// Redirection conviviale pour les nouveautés (tri par plus récents)
Route::get('/nouveautes', function () {
    return redirect()->route('frontend.shop.index', ['sort' => 'newest']);
})->name('nouveautes');
Route::get('/home-2', [HomeController::class, 'index2'])->name('home-2');
Route::get('/home-3', [HomeController::class, 'index3'])->name('home-3');
Route::get('/realisations', [RealisationsController::class, 'index'])->name('realisations');
// Pages About et Contact
Route::get('/a-propos', function () {
    return Inertia::render('Frontend/About');
})->name('a-propos-de-nous');

Route::get('/contact', [FrontendContactController::class, 'index'])->name('contact');
Route::post('/contact', [FrontendContactController::class, 'store'])->name('contact.store');

// Pages légales et informatives
Route::get('/aide-faq', function () {
    return Inertia::render('Frontend/FAQ');
})->name('faq');

Route::get('/livraison', function () {
    return Inertia::render('Frontend/Delivery');
})->name('livraison');

Route::get('/conditions-generales', function () {
    return Inertia::render('Frontend/Terms');
})->name('conditions-generales');

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

// Routes PayPal
Route::prefix('paypal')->name('paypal.')->group(function () {
    Route::post('/create-payment', [PayPalPaymentController::class, 'createPayment'])->name('create');
    Route::get('/callback/success/{order_id}', [PayPalPaymentController::class, 'handleSuccessCallback'])->name('callback.success');
    Route::get('/callback/cancel/{order_id}', [PayPalPaymentController::class, 'handleCancelCallback'])->name('callback.cancel');
    Route::post('/check-status', [PayPalPaymentController::class, 'checkPaymentStatus'])->name('check-status');
});

// Routes Orange Money
Route::prefix('orange-money')->name('orange-money.')->group(function () {
    Route::post('/create-payment', [OrangeMoneyPaymentController::class, 'createPayment'])->name('create');
    Route::get('/callback/success/{order_id}', [OrangeMoneyPaymentController::class, 'handleSuccessCallback'])->name('callback.success');
    Route::get('/callback/cancel/{order_id}', [OrangeMoneyPaymentController::class, 'handleCancelCallback'])->name('callback.cancel');
    Route::post('/webhook', [OrangeMoneyPaymentController::class, 'handleWebhook'])->name('webhook');
    Route::post('/check-status', [OrangeMoneyPaymentController::class, 'checkPaymentStatus'])->name('check-status');
});

// Routes Wave
Route::prefix('wave')->name('wave.')->group(function () {
    Route::post('/create-payment', [WavePaymentController::class, 'createPayment'])->name('create');
    Route::get('/callback/success/{order_id}', [WavePaymentController::class, 'handleSuccessCallback'])->name('callback.success');
    Route::get('/callback/cancel/{order_id}', [WavePaymentController::class, 'handleCancelCallback'])->name('callback.cancel');
    Route::post('/webhook', [WavePaymentController::class, 'handleWebhook'])->name('webhook');
    Route::post('/check-status', [WavePaymentController::class, 'checkPaymentStatus'])->name('check-status');
    Route::post('/refund', [WavePaymentController::class, 'refundPayment'])->name('refund');
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

// Profil Client (auth + verified)
Route::middleware(['auth', 'verified'])->prefix('profile')->name('frontend.profile.')->group(function () {
    Route::get('/', [FrontendProfileController::class, 'index'])->name('index');
    Route::get('/edit', [FrontendProfileController::class, 'edit'])->name('edit');
    Route::put('/update', [FrontendProfileController::class, 'update'])->name('update');
    Route::get('/orders', [FrontendProfileController::class, 'orders'])->name('orders');
    Route::get('/orders/{order}', [FrontendProfileController::class, 'orderDetails'])->name('order');
    Route::get('/addresses', [FrontendProfileController::class, 'addresses'])->name('addresses');
});

// Redirection ordre vers succès
Route::get('/order/success/{sell}', [CartController::class, 'orderSuccess'])->name('frontend.order.success');

// -------------------
// Routes Admin protégées (InertiaJS)
// -------------------
Route::middleware(['auth', 'hasAnyRole:admin,manager'])->prefix('admin')->name('admin.')->group(function () {
// Route::middleware(['auth', 'verified', 'isAdmin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard admin
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Routes de test (à supprimer en production)
    Route::get('/test-notifications', function () {
        // Créer une notification de test
        $notification = \App\Models\Notification::createContactMessage([
            'sender_name' => 'Test Utilisateur',
            'message' => 'Ceci est une notification de test créée via l\'URL /test-notifications'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notification de test créée avec succès !',
            'notification' => $notification,
            'total_notifications' => \App\Models\Notification::count(),
            'unread_count' => \App\Models\Notification::unread()->count(),
        ]);
    });

    Route::get('/test-api', function () {
        return response()->json([
            'status' => 'success',
            'message' => 'API fonctionnelle !',
            'timestamp' => now(),
            'notifications_count' => \App\Models\Notification::count(),
            'settings_count' => \App\Models\Setting::count(),
        ]);
    });

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
        Route::delete('/{user}/avatar', [UserController::class, 'deleteAvatar'])->name('deleteAvatar');
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

    // Routes Notifications
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/header', [NotificationController::class, 'getForHeader'])->name('header');
        Route::get('/{notification}', [NotificationController::class, 'show'])->name('show');
        Route::get('/{notification}/redirect', [NotificationController::class, 'redirect'])->name('redirect');
        Route::put('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('read');
        Route::put('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy');
        Route::post('/bulk-delete', [NotificationController::class, 'bulkDelete'])->name('bulk-delete');
    });

    // Routes Méthodes de Paiement
    Route::prefix('payment-methods')->name('payment-methods.')->middleware(['hasRole:admin'])->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\PaymentMethodController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Admin\PaymentMethodController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Admin\PaymentMethodController::class, 'store'])->name('store');
        Route::get('/{paymentMethod}', [App\Http\Controllers\Admin\PaymentMethodController::class, 'show'])->name('show');
        Route::get('/{paymentMethod}/edit', [App\Http\Controllers\Admin\PaymentMethodController::class, 'edit'])->name('edit');
        Route::put('/{paymentMethod}', [App\Http\Controllers\Admin\PaymentMethodController::class, 'update'])->name('update');
        Route::delete('/{paymentMethod}', [App\Http\Controllers\Admin\PaymentMethodController::class, 'destroy'])->name('destroy');
        Route::patch('/{paymentMethod}/toggle', [App\Http\Controllers\Admin\PaymentMethodController::class, 'toggleStatus'])->name('toggle');
        Route::put('/update-order', [App\Http\Controllers\Admin\PaymentMethodController::class, 'updateOrder'])->name('updateOrder');

        // Routes pour les actions groupées
        Route::post('/bulk-delete', [App\Http\Controllers\Admin\PaymentMethodController::class, 'bulkDelete'])->name('bulk-delete');
        Route::post('/bulk-activate', [App\Http\Controllers\Admin\PaymentMethodController::class, 'bulkActivate'])->name('bulk-activate');
        Route::post('/bulk-deactivate', [App\Http\Controllers\Admin\PaymentMethodController::class, 'bulkDeactivate'])->name('bulk-deactivate');
    });

    // Routes Paramètres
    Route::prefix('settings')->name('settings.')->middleware(['hasRole:admin'])->group(function () {
        Route::get('/', [SettingController::class, 'index'])->name('index');
        Route::put('/', [SettingController::class, 'update'])->name('update');
        Route::get('/get/{key}', [SettingController::class, 'getSetting'])->name('get');
        Route::post('/upload-file', [SettingController::class, 'uploadFile'])->name('upload-file');
        Route::delete('/delete-file', [SettingController::class, 'deleteFile'])->name('delete-file');
        Route::get('/test-messages', [SettingController::class, 'testMessages'])->name('test-messages');
    });

    // Routes Personnalisation du front
    Route::prefix('customizations')->name('customizations.')->group(function () {
        Route::get('/edit', [FrontCustomizationController::class, 'edit'])->name('edit');
        // Accepter PUT et POST pour éviter les soucis de FormData selon le client
        Route::match(['put', 'post'], '/update', [FrontCustomizationController::class, 'update'])->name('update');
    });

    // Routes Règles de TVA
    Route::prefix('tax-rules')->name('tax-rules.')->middleware(['hasRole:admin'])->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\TaxRuleController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Admin\TaxRuleController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Admin\TaxRuleController::class, 'store'])->name('store');
        Route::get('/export', [App\Http\Controllers\Admin\TaxRuleController::class, 'export'])->name('export');
        Route::get('/{taxRule}', [App\Http\Controllers\Admin\TaxRuleController::class, 'show'])->name('show');
        Route::get('/{taxRule}/edit', [App\Http\Controllers\Admin\TaxRuleController::class, 'edit'])->name('edit');
        Route::put('/{taxRule}', [App\Http\Controllers\Admin\TaxRuleController::class, 'update'])->name('update');
        Route::delete('/{taxRule}', [App\Http\Controllers\Admin\TaxRuleController::class, 'destroy'])->name('destroy');
        Route::patch('/{taxRule}/set-default', [App\Http\Controllers\Admin\TaxRuleController::class, 'setDefault'])->name('set-default');
        Route::patch('/{taxRule}/toggle-active', [App\Http\Controllers\Admin\TaxRuleController::class, 'toggleActive'])->name('toggle-active');

        // Actions en lot
        Route::post('/bulk-activate', [App\Http\Controllers\Admin\TaxRuleController::class, 'bulkActivate'])->name('bulk-activate');
        Route::post('/bulk-deactivate', [App\Http\Controllers\Admin\TaxRuleController::class, 'bulkDeactivate'])->name('bulk-deactivate');
        Route::delete('/bulk-delete', [App\Http\Controllers\Admin\TaxRuleController::class, 'bulkDelete'])->name('bulk-delete');
    });
});

// Routes API pour les règles de TVA (publiques)
Route::prefix('api/tax')->name('api.tax.')->group(function () {
    Route::get('/info/{countryCode}', [App\Http\Controllers\Admin\TaxRuleController::class, 'getTaxInfo'])->name('info');
    Route::post('/calculate', [App\Http\Controllers\Admin\TaxRuleController::class, 'calculateTax'])->name('calculate');
});

// Auth routes (login, register, etc.)
require __DIR__ . '/auth.php';

// Routes de test (à supprimer en production)
if (app()->environment(['local', 'staging'])) {
    require __DIR__ . '/test.php';
}
