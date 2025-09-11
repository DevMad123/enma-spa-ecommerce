<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductCategoryController;
use App\Http\Controllers\Api\ProductSubcategoryController;
use App\Http\Controllers\Api\BrandController;

// Authentification publique
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées par Sanctum (utilisateur connecté)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/user/changePassword', [AuthController::class, 'changePassword']);
});

// API produits (affichage, détails)
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']); // Liste des produits
    Route::get('/{id}', [ProductController::class, 'show']); // Détail produit
});

// API catégories
Route::prefix('categories')->group(function () {
    Route::get('/', [ProductCategoryController::class, 'index']); // Liste des catégories
    Route::get('/{id}', [ProductCategoryController::class, 'show']); // Détail catégorie
});

// API sous-catégories
Route::prefix('subcategories')->group(function () {
    Route::get('/', [ProductSubcategoryController::class, 'index']); // Liste des sous-catégories
    Route::get('/{id}', [ProductSubcategoryController::class, 'show']); // Détail sous-catégorie
});

// API marques
Route::prefix('brands')->group(function () {
    Route::get('/', [BrandController::class, 'index']); // Liste des marques
    Route::get('/{id}', [BrandController::class, 'show']); // Détail marque
});