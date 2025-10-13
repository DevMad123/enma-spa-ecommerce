<?php

use Illuminate\Http\Request;
use App\Models\Shipping;

Route::get('/test-delivery-dates', function () {
    $shippingMethods = Shipping::select(['id', 'name', 'description', 'estimated_days'])->get();
    
    $result = [];
    foreach ($shippingMethods as $method) {
        $result[] = [
            'id' => $method->id,
            'name' => $method->name,
            'estimated_days' => $method->estimated_days,
            'description' => $method->description
        ];
    }
    
    return response()->json([
        'message' => 'Test des délais de livraison',
        'shipping_methods' => $result,
        'test_delivery_calculation' => [
            'estimated_days' => 3,
            'today' => now()->format('Y-m-d'),
            'delivery_date' => now()->addDays(3)->format('Y-m-d'),
            'formatted_date_fr' => now()->addDays(3)->locale('fr')->isoFormat('dddd D MMMM YYYY'),
        ]
    ]);
});