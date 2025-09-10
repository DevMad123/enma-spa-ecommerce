<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;

// Authentification publique
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées par Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/user/changePassword', [AuthController::class, 'changePassword']);
});

// Groupe protégé par Sanctum
Route::middleware('auth:sanctum')->prefix('product')->group(function () {
    // Liste des produits
    Route::get('/', [ProductController::class, 'index']); // GET /api/product

    // Créer un produit
    Route::post('/', [ProductController::class, 'store']); // POST /api/product

    // Détails d'un produit
    Route::get('/{id}', [ProductController::class, 'show']); // GET /api/product/{id}

    // Modifier un produit
    Route::put('/{id}', [ProductController::class, 'productUpdate']); // PUT /api/product/{id}

    // Supprimer un produit
    Route::delete('/{id}', [ProductController::class, 'destroy']); // DELETE /api/product/{id}

    // Couleurs du produit
    Route::get('/{id}/color', [ProductController::class, 'productColor']); // GET /api/product/{id}/color
    Route::post('/{id}/color', [ProductController::class, 'productColorStore']); // POST /api/product/{id}/color
    Route::put('/{id}/color', [ProductController::class, 'productColorUpdate']); // PUT /api/product/{id}/color

    // Tailles du produit
    Route::get('/{id}/size', [ProductController::class, 'productSize']); // GET /api/product/{id}/size
    Route::post('/{id}/size', [ProductController::class, 'productSizeStore']); // POST /api/product/{id}/size
    Route::put('/{id}/size', [ProductController::class, 'productSizeUpdate']); // PUT /api/product/{id}/size

    // Image du produit
    Route::delete('/{id}/image', [ProductController::class, 'imageDelete']); // DELETE /api/product/{id}/image
});