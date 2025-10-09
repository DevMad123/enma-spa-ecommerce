<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TestShippingController;

Route::get('/test-shipping', [TestShippingController::class, 'testShipping']);

Route::post('/test-store', function(\Illuminate\Http\Request $request) {
    \Log::info('TEST ROUTE APPELÉE');
    \Log::info('Données reçues:', $request->all());
    
    return response()->json([
        'success' => true,
        'message' => 'Route test fonctionnelle',
        'data_received' => $request->all()
    ]);
})->name('test.store');