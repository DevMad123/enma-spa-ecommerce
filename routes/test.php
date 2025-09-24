<?php

use Illuminate\Support\Facades\Route;

Route::post('/test-store', function(\Illuminate\Http\Request $request) {
    \Log::info('TEST ROUTE APPELÉE');
    \Log::info('Données reçues:', $request->all());
    
    return response()->json([
        'success' => true,
        'message' => 'Route test fonctionnelle',
        'data_received' => $request->all()
    ]);
})->name('test.store');