<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\RealisationsController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\ProductCategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductSubcategoryController;
use App\Http\Controllers\Admin\BrandController;

// Route::redirect('/', '/dashboard');
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/home-2', [HomeController::class, 'index2'])->name('home-2');
Route::get('/home-3', [HomeController::class, 'index3'])->name('home-3');
Route::get('/realisations', [RealisationsController::class, 'index'])->name('realisations');
Route::get('/a-propos-de-nous', [AboutController::class, 'index'])->name('a-propos-de-nous');
Route::get('/a-propos-de-nous-pro', [AboutController::class, 'indexPro'])->name('a-propos-de-nous-pro');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');

Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::resource('projects', ProjectController::class);
    Route::get('/tasks/my-tasks', [TaskController::class, 'myTasks'])
        ->name('tasks.myTasks');
    Route::resource('tasks', TaskController::class);
    Route::resource('users', UserController::class);

    Route::get('/home', [HomeController::class, 'index'])->name('home');
    Route::get('/create/product/view', [ProductController::class, 'createProduct'])->name('admin.create.product');
    Route::post('/product/store', [ProductController::class, 'storeProduct'])->name('admin.store.product');
    Route::get('/product/list', [ProductController::class, 'productList'])->name('admin.product.list');
    Route::get('/product/edit/info', [ProductController::class, 'productEditDetails'])->name('product.edit.info');
    Route::get('/product/image/delete', [ProductController::class, 'imageDelete'])->name('product.image.delete');
    Route::post('/product/update', [ProductController::class, 'productUpdate'])->name('admin.edit.product');
    Route::get('/product/color', [ProductController::class, 'productColor'])->name('admin.product.color.show');
    Route::post('/product/color/store', [ProductController::class, 'productColorStore'])->name('admin.product.color.store');
    Route::post('/product/color/update', [ProductController::class, 'productColorUpdate'])->name('admin.product.color.update');

    Route::get('/product/size', [ProductController::class, 'productSize'])->name('admin.product.size.show');
    Route::post('/product/size/store', [ProductController::class, 'productSizeStore'])->name('admin.product.size.store');
    Route::post('/product/size/update', [ProductController::class, 'productSizeUpdate'])->name('admin.product.size.update');

    Route::get('/product/category', [ProductCategoryController::class, 'productCategory'])->name('admin.product.category');
    Route::post('/product/category/store', [ProductCategoryController::class, 'productCategoryStore'])->name('admin.store.category');
    Route::post('/product/category/update', [ProductCategoryController::class, 'productCategoryUpdate'])->name('admin.update.category');
    Route::get('/product/category/delete', [ProductCategoryController::class, 'productCategoryDelete'])->name('admin.delete.category');

    Route::get('/product/brand', [BrandController::class, 'brandShow'])->name('admin.product.brand');
    Route::post('/product/brand/store', [BrandController::class, 'brandStore'])->name('admin.product.brand.store');

    Route::post('/product/brand/update', [BrandController::class, 'brandUpdate'])->name('admin.product.brand.update');

    Route::get('/product/subcategory', [ProductSubcategoryController::class, 'productSubcategory'])->name('admin.product.subcategory');
    Route::post('/product/subcategory/store', [ProductSubcategoryController::class, 'productSubCategoryStore'])->name('admin.store.subcategory');
    Route::post('/product/subcategory/update', [ProductSubcategoryController::class, 'productSubCategoryUpdate'])->name('admin.update.subcategory');
    Route::get('/product/subcategory/delete', [ProductSubcategoryController::class, 'productSubCategoryDelete'])->name('admin.delete.subcategory');
    Route::get('/product/subcategory/list/get', [ProductSubcategoryController::class, 'subcategoryListGet'])->name('subcategory.list.get');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
