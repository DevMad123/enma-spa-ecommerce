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

// Route de test pour vérifier les délais de livraison
Route::get('/test-delivery-dates', function () {
    $shippings = \App\Models\Shipping::select(['id', 'name', 'description', 'price', 'estimated_days'])
        ->where('is_active', true)
        ->get();

    $response = [
        'success' => true,
        'message' => 'Test des délais de livraison',
        'shipping_methods' => []
    ];

    foreach ($shippings as $shipping) {
        $response['shipping_methods'][] = [
            'id' => $shipping->id,
            'name' => $shipping->name,
            'description' => $shipping->description,
            'price' => $shipping->price,
            'estimated_days' => $shipping->estimated_days,
            'delivery_message_fr' => $shipping->estimated_days 
                ? "Livraison en {$shipping->estimated_days} jour(s) ouvré(s)"
                : 'Délai à confirmer',
        ];
    }

    return response()->json($response);
})->name('test.delivery-dates');