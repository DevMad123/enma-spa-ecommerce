<?php

namespace App\Http\Controllers;

use App\Models\Sell;
use App\Models\Shipping;
use App\Models\Ecommerce_customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TestOrderController extends Controller
{
    public function debugOrder($sellId)
    {
        $sell = Sell::with(['customer', 'sellDetails.product', 'paymentMethod'])
            ->findOrFail($sellId);
            
        $shippingMethod = null;
        if ($sell->shipping_id) {
            $shippingMethod = Shipping::find($sell->shipping_id);
        }
        
        $debugData = [
            'sell_raw' => $sell->toArray(),
            'sell_details_count' => $sell->sellDetails->count(),
            'shipping_method' => $shippingMethod ? $shippingMethod->toArray() : null,
            'calculated_values' => [
                'subtotal' => floatval($sell->total_amount ?? 0),
                'shipping_cost' => floatval($sell->shipping_cost ?? 0),
                'tax' => floatval($sell->total_vat_amount ?? 0),
                'total' => floatval($sell->total_payable_amount ?? 0),
            ],
            'customer_data' => $sell->customer ? $sell->customer->toArray() : null,
        ];
        
        return response()->json($debugData, 200, [], JSON_PRETTY_PRINT);
    }
}